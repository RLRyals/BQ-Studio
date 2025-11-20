/**
 * OpenAIProvider - OpenAI GPT API integration
 */

import OpenAI from 'openai';
import {
  AIProviderInterface,
  AIRequestOptions,
  AIResponse,
  StreamCallback,
  StreamChunk,
  ProviderConfig,
  TokenUsage,
  AIServiceError,
  ErrorCode,
  Message,
} from '../types';
import { TokenTracker } from '../TokenTracker';

export class OpenAIProvider implements AIProviderInterface {
  private client: OpenAI | null = null;
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
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
      });
    } catch (error) {
      throw new AIServiceError(
        'Failed to initialize OpenAI client',
        ErrorCode.PROVIDER_NOT_CONFIGURED,
        'openai',
        undefined,
        error as Error
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null && !!this.config.apiKey;
  }

  getProvider() {
    return 'openai' as const;
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

  private convertMessages(messages: Message[]): Array<OpenAI.Chat.ChatCompletionMessageParam> {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  async sendRequest(options: AIRequestOptions): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new AIServiceError(
        'OpenAI provider is not configured',
        ErrorCode.PROVIDER_NOT_CONFIGURED,
        'openai'
      );
    }

    await this.checkRateLimit();

    const startTime = Date.now();

    try {
      const messages = this.convertMessages(options.messages);

      // Add system prompt if provided
      if (options.systemPrompt) {
        messages.unshift({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      const response = await this.client!.chat.completions.create({
        model: options.model,
        messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
      });

      const choice = response.choices[0];
      const content = choice.message.content || '';

      const usage: TokenUsage = {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      };

      const cost = this.tokenTracker.calculateCost(usage, options.model);
      this.tokenTracker.trackUsage(usage, cost);

      return {
        content,
        usage,
        cost,
        model: options.model,
        provider: 'openai',
        finishReason: choice.finish_reason || undefined,
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
        'OpenAI provider is not configured',
        ErrorCode.PROVIDER_NOT_CONFIGURED,
        'openai'
      );
    }

    await this.checkRateLimit();

    const startTime = Date.now();

    try {
      const messages = this.convertMessages(options.messages);

      // Add system prompt if provided
      if (options.systemPrompt) {
        messages.unshift({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      const stream = await this.client!.chat.completions.create({
        model: options.model,
        messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        stream: true,
      });

      let fullContent = '';
      let finishReason: string | undefined;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        const content = delta?.content || '';

        if (content) {
          fullContent += content;
          callback({
            content,
            done: false,
          });
        }

        if (chunk.choices[0]?.finish_reason) {
          finishReason = chunk.choices[0].finish_reason;
        }
      }

      // OpenAI doesn't provide usage stats in streaming mode
      // We need to estimate tokens (this is a limitation)
      const usage: TokenUsage = {
        inputTokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
        outputTokens: this.estimateTokens(fullContent),
        totalTokens: 0,
      };
      usage.totalTokens = usage.inputTokens + usage.outputTokens;

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
        provider: 'openai',
        finishReason,
        timestamp: new Date(),
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      throw this.handleError(error, duration);
    }
  }

  /**
   * Rough token estimation (4 characters per token average)
   * Note: This is an approximation. For accurate tracking, use non-streaming mode
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private handleError(error: any, duration: number): AIServiceError {
    let code = ErrorCode.UNKNOWN_ERROR;
    let statusCode: number | undefined;
    let message = 'An unknown error occurred';

    if (error instanceof OpenAI.APIError) {
      statusCode = error.status;
      message = error.message;

      if (error.status === 401) {
        code = ErrorCode.INVALID_API_KEY;
      } else if (error.status === 429) {
        code = ErrorCode.RATE_LIMIT_EXCEEDED;
      } else if (error.status >= 400 && error.status < 500) {
        code = ErrorCode.INVALID_REQUEST;
      } else if (error.status >= 500) {
        code = ErrorCode.SERVER_ERROR;
      }
    } else if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      code = ErrorCode.TIMEOUT;
      message = 'Request timed out';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      code = ErrorCode.NETWORK_ERROR;
      message = 'Network error occurred';
    }

    console.error(`OpenAI API error after ${duration}ms:`, {
      code,
      statusCode,
      message,
      originalError: error,
    });

    return new AIServiceError(message, code, 'openai', statusCode, error);
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

export default OpenAIProvider;
