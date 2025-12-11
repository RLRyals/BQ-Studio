"use strict";
/**
 * OpenAIProvider - OpenAI GPT API integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const types_1 = require("../types");
class OpenAIProvider {
    constructor(config, tokenTracker) {
        this.client = null;
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.config = config;
        this.tokenTracker = tokenTracker;
        if (config.apiKey) {
            this.initializeClient();
        }
    }
    initializeClient() {
        try {
            this.client = new openai_1.default({
                apiKey: this.config.apiKey,
                baseURL: this.config.baseURL,
            });
        }
        catch (error) {
            throw new types_1.AIServiceError('Failed to initialize OpenAI client', types_1.ErrorCode.PROVIDER_NOT_CONFIGURED, 'openai', undefined, error);
        }
    }
    isAvailable() {
        return this.client !== null && !!this.config.apiKey;
    }
    getProvider() {
        return 'openai';
    }
    async checkRateLimit() {
        if (!this.config.rateLimit)
            return;
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
    convertMessages(messages) {
        return messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
    }
    async sendRequest(options) {
        if (!this.isAvailable()) {
            throw new types_1.AIServiceError('OpenAI provider is not configured', types_1.ErrorCode.PROVIDER_NOT_CONFIGURED, 'openai');
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
            const response = await this.client.chat.completions.create({
                model: options.model,
                messages,
                max_tokens: options.maxTokens,
                temperature: options.temperature,
                top_p: options.topP,
            });
            const choice = response.choices[0];
            const content = choice.message.content || '';
            const usage = {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            throw this.handleError(error, duration);
        }
    }
    async sendStreamRequest(options, callback) {
        if (!this.isAvailable()) {
            throw new types_1.AIServiceError('OpenAI provider is not configured', types_1.ErrorCode.PROVIDER_NOT_CONFIGURED, 'openai');
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
            const stream = await this.client.chat.completions.create({
                model: options.model,
                messages,
                max_tokens: options.maxTokens,
                temperature: options.temperature,
                top_p: options.topP,
                stream: true,
            });
            let fullContent = '';
            let finishReason;
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
            const usage = {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            throw this.handleError(error, duration);
        }
    }
    /**
     * Rough token estimation (4 characters per token average)
     * Note: This is an approximation. For accurate tracking, use non-streaming mode
     */
    estimateTokens(text) {
        return Math.ceil(text.length / 4);
    }
    handleError(error, duration) {
        let code = types_1.ErrorCode.UNKNOWN_ERROR;
        let statusCode;
        let message = 'An unknown error occurred';
        if (error instanceof openai_1.default.APIError) {
            statusCode = error.status;
            message = error.message;
            if (error.status === 401) {
                code = types_1.ErrorCode.INVALID_API_KEY;
            }
            else if (error.status === 429) {
                code = types_1.ErrorCode.RATE_LIMIT_EXCEEDED;
            }
            else if (error.status >= 400 && error.status < 500) {
                code = types_1.ErrorCode.INVALID_REQUEST;
            }
            else if (error.status >= 500) {
                code = types_1.ErrorCode.SERVER_ERROR;
            }
        }
        else if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
            code = types_1.ErrorCode.TIMEOUT;
            message = 'Request timed out';
        }
        else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            code = types_1.ErrorCode.NETWORK_ERROR;
            message = 'Network error occurred';
        }
        console.error(`OpenAI API error after ${duration}ms:`, {
            code,
            statusCode,
            message,
            originalError: error,
        });
        return new types_1.AIServiceError(message, code, 'openai', statusCode, error);
    }
    /**
     * Get the current request count (for rate limiting)
     */
    getRequestCount() {
        return this.requestCount;
    }
    /**
     * Reset the request count
     */
    resetRequestCount() {
        this.requestCount = 0;
        this.lastRequestTime = 0;
    }
}
exports.OpenAIProvider = OpenAIProvider;
exports.default = OpenAIProvider;
