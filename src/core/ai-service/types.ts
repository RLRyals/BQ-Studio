/**
 * AI Service Types
 * Comprehensive type definitions for multi-provider AI service
 */

export type AIProvider = 'anthropic' | 'openai';

export type AIModel =
  // Anthropic models
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  // OpenAI models
  | 'gpt-4-turbo-preview'
  | 'gpt-4-1106-preview'
  | 'gpt-4'
  | 'gpt-3.5-turbo-0125'
  | 'gpt-3.5-turbo';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequestOptions {
  model: AIModel;
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface CostCalculation {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

export interface AIResponse {
  content: string;
  usage: TokenUsage;
  cost: CostCalculation;
  model: AIModel;
  provider: AIProvider;
  finishReason?: string;
  timestamp: Date;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  usage?: TokenUsage;
  cost?: CostCalculation;
}

export type StreamCallback = (chunk: StreamChunk) => void;

export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
}

export interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  rateLimit?: RateLimitConfig;
}

export interface AIServiceConfig {
  anthropic?: ProviderConfig;
  openai?: ProviderConfig;
  defaultProvider?: AIProvider;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface InteractionLog {
  id: string;
  provider: AIProvider;
  model: AIModel;
  request: AIRequestOptions;
  response: AIResponse;
  error?: Error;
  timestamp: Date;
  duration: number;
}

export interface AIProviderInterface {
  sendRequest(options: AIRequestOptions): Promise<AIResponse>;
  sendStreamRequest(options: AIRequestOptions, callback: StreamCallback): Promise<AIResponse>;
  isAvailable(): boolean;
  getProvider(): AIProvider;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: AIProvider,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export enum ErrorCode {
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ModelPricing {
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
}

export type PricingMap = Record<AIModel, ModelPricing>;
