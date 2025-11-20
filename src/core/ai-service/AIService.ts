/**
 * AIService - Multi-provider AI service orchestrator
 * Handles provider selection, retry logic, and interaction logging
 */

import Store from 'electron-store';
import {
  AIProvider,
  AIRequestOptions,
  AIResponse,
  StreamCallback,
  AIServiceConfig,
  ProviderConfig,
  InteractionLog,
  AIServiceError,
  ErrorCode,
  RetryConfig,
} from './types';
import { TokenTracker } from './TokenTracker';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';

interface StoredConfig {
  anthropic?: {
    apiKey?: string;
  };
  openai?: {
    apiKey?: string;
  };
  defaultProvider?: AIProvider;
}

export class AIService {
  private anthropicProvider: AnthropicProvider | null = null;
  private openaiProvider: OpenAIProvider | null = null;
  private tokenTracker: TokenTracker;
  private store: Store<StoredConfig>;
  private config: AIServiceConfig;
  private retryConfig: RetryConfig;
  private interactionLogs: InteractionLog[] = [];

  constructor(config?: AIServiceConfig) {
    // Initialize electron-store with encryption
    this.store = new Store<StoredConfig>({
      name: 'ai-service-config',
      encryptionKey: 'bq-studio-ai-service-encryption-key', // In production, use a more secure key
    });

    this.tokenTracker = new TokenTracker();

    // Load config from store or use provided config
    const storedConfig = this.loadConfigFromStore();
    this.config = {
      ...storedConfig,
      ...config,
    };

    // Default retry configuration
    this.retryConfig = {
      maxAttempts: config?.retryAttempts || 3,
      initialDelay: config?.retryDelay || 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    };

    // Initialize providers
    this.initializeProviders();
  }

  private loadConfigFromStore(): AIServiceConfig {
    const storedConfig = this.store.get('anthropic');
    const storedOpenAI = this.store.get('openai');
    const defaultProvider = this.store.get('defaultProvider');

    return {
      anthropic: storedConfig
        ? {
            apiKey: storedConfig.apiKey || '',
          }
        : undefined,
      openai: storedOpenAI
        ? {
            apiKey: storedOpenAI.apiKey || '',
          }
        : undefined,
      defaultProvider,
    };
  }

  private initializeProviders(): void {
    if (this.config.anthropic?.apiKey) {
      this.anthropicProvider = new AnthropicProvider(
        this.config.anthropic,
        this.tokenTracker
      );
    }

    if (this.config.openai?.apiKey) {
      this.openaiProvider = new OpenAIProvider(
        this.config.openai,
        this.tokenTracker
      );
    }
  }

  /**
   * Configure a provider with API key and settings
   */
  configureProvider(provider: AIProvider, config: ProviderConfig): void {
    // Store encrypted API key
    this.store.set(provider, { apiKey: config.apiKey });

    if (provider === 'anthropic') {
      this.config.anthropic = config;
      this.anthropicProvider = new AnthropicProvider(config, this.tokenTracker);
    } else if (provider === 'openai') {
      this.config.openai = config;
      this.openaiProvider = new OpenAIProvider(config, this.tokenTracker);
    }
  }

  /**
   * Set the default provider
   */
  setDefaultProvider(provider: AIProvider): void {
    this.config.defaultProvider = provider;
    this.store.set('defaultProvider', provider);
  }

  /**
   * Get the appropriate provider for a request
   */
  private getProvider(provider?: AIProvider): AnthropicProvider | OpenAIProvider {
    const targetProvider = provider || this.config.defaultProvider;

    if (!targetProvider) {
      throw new AIServiceError(
        'No provider specified and no default provider set',
        ErrorCode.PROVIDER_NOT_CONFIGURED
      );
    }

    if (targetProvider === 'anthropic') {
      if (!this.anthropicProvider || !this.anthropicProvider.isAvailable()) {
        throw new AIServiceError(
          'Anthropic provider is not configured or available',
          ErrorCode.PROVIDER_NOT_CONFIGURED,
          'anthropic'
        );
      }
      return this.anthropicProvider;
    } else if (targetProvider === 'openai') {
      if (!this.openaiProvider || !this.openaiProvider.isAvailable()) {
        throw new AIServiceError(
          'OpenAI provider is not configured or available',
          ErrorCode.PROVIDER_NOT_CONFIGURED,
          'openai'
        );
      }
      return this.openaiProvider;
    }

    throw new AIServiceError(
      `Unknown provider: ${targetProvider}`,
      ErrorCode.PROVIDER_NOT_CONFIGURED
    );
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | undefined;
    let delay = this.retryConfig.initialDelay;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error instanceof AIServiceError &&
          (error.code === ErrorCode.INVALID_API_KEY ||
            error.code === ErrorCode.INVALID_REQUEST)
        ) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === this.retryConfig.maxAttempts) {
          console.error(
            `${context} failed after ${attempt} attempts:`,
            error
          );
          throw error;
        }

        // Log retry attempt
        console.warn(
          `${context} attempt ${attempt} failed, retrying in ${delay}ms:`,
          error.message
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Increase delay with exponential backoff
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier,
          this.retryConfig.maxDelay
        );
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * Send a request to the AI provider
   */
  async sendRequest(
    options: AIRequestOptions,
    provider?: AIProvider
  ): Promise<AIResponse> {
    const targetProvider = this.getProvider(provider);
    const startTime = Date.now();

    try {
      const response = await this.retryWithBackoff(
        () => targetProvider.sendRequest(options),
        `AI request to ${targetProvider.getProvider()}`
      );

      // Log interaction
      this.logInteraction({
        id: this.generateId(),
        provider: targetProvider.getProvider(),
        model: options.model,
        request: options,
        response,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      // Log failed interaction
      this.logInteraction({
        id: this.generateId(),
        provider: targetProvider.getProvider(),
        model: options.model,
        request: options,
        response: {
          content: '',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          cost: { inputCost: 0, outputCost: 0, totalCost: 0, currency: 'USD' },
          model: options.model,
          provider: targetProvider.getProvider(),
          timestamp: new Date(),
        },
        error: error as Error,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Send a streaming request to the AI provider
   */
  async sendStreamRequest(
    options: AIRequestOptions,
    callback: StreamCallback,
    provider?: AIProvider
  ): Promise<AIResponse> {
    const targetProvider = this.getProvider(provider);
    const startTime = Date.now();

    try {
      const response = await this.retryWithBackoff(
        () => targetProvider.sendStreamRequest(options, callback),
        `AI stream request to ${targetProvider.getProvider()}`
      );

      // Log interaction
      this.logInteraction({
        id: this.generateId(),
        provider: targetProvider.getProvider(),
        model: options.model,
        request: options,
        response,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      // Log failed interaction
      this.logInteraction({
        id: this.generateId(),
        provider: targetProvider.getProvider(),
        model: options.model,
        request: options,
        response: {
          content: '',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          cost: { inputCost: 0, outputCost: 0, totalCost: 0, currency: 'USD' },
          model: options.model,
          provider: targetProvider.getProvider(),
          timestamp: new Date(),
        },
        error: error as Error,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Log an interaction for debugging and analytics
   */
  private logInteraction(log: InteractionLog): void {
    this.interactionLogs.push(log);

    // Keep only last 100 logs in memory
    if (this.interactionLogs.length > 100) {
      this.interactionLogs.shift();
    }

    // Log to console for debugging
    console.log('AI Interaction:', {
      id: log.id,
      provider: log.provider,
      model: log.model,
      duration: log.duration,
      usage: log.response.usage,
      cost: log.response.cost,
      error: log.error?.message,
    });
  }

  /**
   * Get interaction logs
   */
  getInteractionLogs(): InteractionLog[] {
    return [...this.interactionLogs];
  }

  /**
   * Clear interaction logs
   */
  clearInteractionLogs(): void {
    this.interactionLogs = [];
  }

  /**
   * Get token tracker instance
   */
  getTokenTracker(): TokenTracker {
    return this.tokenTracker;
  }

  /**
   * Get provider availability status
   */
  getProviderStatus(): {
    anthropic: boolean;
    openai: boolean;
    defaultProvider?: AIProvider;
  } {
    return {
      anthropic: this.anthropicProvider?.isAvailable() || false,
      openai: this.openaiProvider?.isAvailable() || false,
      defaultProvider: this.config.defaultProvider,
    };
  }

  /**
   * Generate a unique ID for logs
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simple prompt templating system
   */
  applyTemplate(template: string, variables: Record<string, string>): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Convenience method for simple completions
   */
  async complete(
    prompt: string,
    model: AIRequestOptions['model'],
    provider?: AIProvider
  ): Promise<string> {
    const response = await this.sendRequest(
      {
        model,
        messages: [{ role: 'user', content: prompt }],
      },
      provider
    );

    return response.content;
  }

  /**
   * Convenience method for chat completions
   */
  async chat(
    messages: AIRequestOptions['messages'],
    model: AIRequestOptions['model'],
    provider?: AIProvider
  ): Promise<string> {
    const response = await this.sendRequest(
      {
        model,
        messages,
      },
      provider
    );

    return response.content;
  }
}

export default AIService;
