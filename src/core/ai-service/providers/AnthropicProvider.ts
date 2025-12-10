/**
 * AnthropicProvider - Anthropic Claude API integration
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AIProviderInterface,
  AIRequestOptions,
  AIResponse,
  StreamCallback,
  ProviderConfig,
  TokenUsage,
  AIServiceError,
  ErrorCode,
  Message,
} from '../types';
import { TokenTracker } from '../TokenTracker';

export class AnthropicProvider implements AIProviderInterface {
  private client: Anthropic | null = null;
  private config: ProviderConfig;
  private tokenTracker: TokenTracker;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config: ProviderConfig, tokenTracker: TokenTracker) {
    this.config = config;
    this.tokenTracker = tokenTracker;

    if (config.apiKey) {
      this.initializeClient();
    }
  }

  private initializeClient(): void {
    try {
      this.client = new Anthropic({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
      });
    } catch (error) {
      throw new AIServiceError(
        'Failed to initialize Anthropic client',
        ErrorCode.PROVIDER_NOT_CONFIGURED,
        'anthropic',
        undefined,
        error as Error
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!this.config.apiKey;
  }

  getProvider() {
    return 'anthropic' as const;
  }

  private async checkRateLimit(): Promise<void> {
    if (!this.config.rateLimit) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / this.config.rateLimit.requestsPerMinute;

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  private convertMessages(messages: Message[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  private extractSystemPrompt(messages: Message[], defaultSystem?: string): string | undefined {
    const systemMessage = messages.find((msg) => msg.role === 'system');
    return systemMessage?.content || defaultSystem;
  }

  async sendRequest(options: AIRequestOptions): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new AIServiceError(
        'Anthropic provider is not configured',
        ErrorCode.PROVIDER_NOT_CONFIGURED,
        'anthropic'
      );
    }

    await this.checkRateLimit();

    const startTime = Date.now();

    try {
      const systemPrompt = this.extractSystemPrompt(options.messages, options.systemPrompt);
      const messages = this.convertMessages(options.messages);

      const response = await this.client!.messages.create({
        model: options.model,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature,
        top_p: options.topP,
        system: systemPrompt,
        messages,
      });

      const usage: TokenUsage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      };

      const cost = this.tokenTracker.calculateCost(usage, options.model);
      this.tokenTracker.trackUsage(usage, cost);

      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('');

      return {
        content,
        usage,
        cost,
        model: options.model,
        provider: 'anthropic',
        finishReason: response.stop_reason || undefined,
        timestamp: new Date(),
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      throw this.handleError(error, duration);
    }
  }

  async sendStreamRequest(options: AIRequestOptions, callback: StreamCallback): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new AIServiceError(
        'Anthropic provider is not configured',
        ErrorCode.PROVIDER_NOT_CONFIGURED,
        'anthropic'
      );
    }

    await this.checkRateLimit();

    const startTime = Date.now();

    try {
      const systemPrompt = this.extractSystemPrompt(options.messages, options.systemPrompt);
      const messages = this.convertMessages(options.messages);

      const stream = await this.client!.messages.create({
        model: options.model,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature,
        top_p: options.topP,
        system: systemPrompt,
        messages,
        stream: true,
      });

      let fullContent = '';
      let usage: TokenUsage | undefined;
      let finishReason: string | undefined;

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            const chunk = event.delta.text;
            fullContent += chunk;
            callback({
              content: chunk,
              done: false,
            });
          }
        } else if (event.type === 'message_delta') {
          if (event.usage) {
            usage = {
              inputTokens: 0,
              outputTokens: event.usage.output_tokens,
              totalTokens: event.usage.output_tokens,
            };
          }
          finishReason = event.delta.stop_reason || undefined;
        } else if (event.type === 'message_start') {
          if (event.message.usage) {
            usage = {
              inputTokens: event.message.usage.input_tokens,
              outputTokens: event.message.usage.output_tokens,
              totalTokens: event.message.usage.input_tokens + event.message.usage.output_tokens,
            };
          }
        }
      }

      if (!usage) {
        usage = {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        };
      }

      const cost = this.tokenTracker.calculateCost(usage, options.model);
      this.tokenTracker.trackUsage(usage, cost);

      // Send final chunk with usage and cost
      callback({
        content: '',
        done: true,
        usage,
        cost,
      });

      return {
        content: fullContent,
        usage,
        cost,
        model: options.model,
        provider: 'anthropic',
        finishReason,
        timestamp: new Date(),
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      throw this.handleError(error, duration);
    }
  }

  private handleError(error: any, duration: number): AIServiceError {
    let code = ErrorCode.UNKNOWN_ERROR;
    let statusCode: number | undefined;
    let message = 'An unknown error occurred';

    if (error instanceof Anthropic.APIError) {
      statusCode = error.status;
      message = error.message;

      if (error.status === 401) {
        code = ErrorCode.INVALID_API_KEY;
      } else if (error.status === 429) {
        code = ErrorCode.RATE_LIMIT_EXCEEDED;
      } else if (error.status !== undefined && error.status >= 400 && error.status < 500) {
        code = ErrorCode.INVALID_REQUEST;
      } else if (error.status !== undefined && error.status >= 500) {
        code = ErrorCode.SERVER_ERROR;
      }
    } else if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      code = ErrorCode.TIMEOUT;
      message = 'Request timed out';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      code = ErrorCode.NETWORK_ERROR;
      message = 'Network error occurred';
    }

    console.error(`Anthropic API error after ${duration}ms:`, {
      code,
      statusCode,
      message,
      originalError: error,
    });

    return new AIServiceError(message, code, 'anthropic', statusCode, error);
  }

  /**
   * Get the current request count (for rate limiting)
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Reset the request count
   */
  resetRequestCount(): void {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
}

export default AnthropicProvider;
