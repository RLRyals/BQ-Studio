"use strict";
/**
 * AnthropicProvider - Anthropic Claude API integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const types_1 = require("../types");
class AnthropicProvider {
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
            this.client = new sdk_1.default({
                apiKey: this.config.apiKey,
                baseURL: this.config.baseURL,
            });
        }
        catch (error) {
            throw new types_1.AIServiceError('Failed to initialize Anthropic client', types_1.ErrorCode.PROVIDER_NOT_CONFIGURED, 'anthropic', undefined, error);
        }
    }
    isAvailable() {
        return this.client !== null && !!this.config.apiKey;
    }
    getProvider() {
        return 'anthropic';
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
        return messages
            .filter((msg) => msg.role !== 'system')
            .map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
    }
    extractSystemPrompt(messages, defaultSystem) {
        const systemMessage = messages.find((msg) => msg.role === 'system');
        return systemMessage?.content || defaultSystem;
    }
    async sendRequest(options) {
        if (!this.isAvailable()) {
            throw new types_1.AIServiceError('Anthropic provider is not configured', types_1.ErrorCode.PROVIDER_NOT_CONFIGURED, 'anthropic');
        }
        await this.checkRateLimit();
        const startTime = Date.now();
        try {
            const systemPrompt = this.extractSystemPrompt(options.messages, options.systemPrompt);
            const messages = this.convertMessages(options.messages);
            const response = await this.client.messages.create({
                model: options.model,
                max_tokens: options.maxTokens || 4096,
                temperature: options.temperature,
                top_p: options.topP,
                system: systemPrompt,
                messages,
            });
            const usage = {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            };
            const cost = this.tokenTracker.calculateCost(usage, options.model);
            this.tokenTracker.trackUsage(usage, cost);
            const content = response.content
                .filter((block) => block.type === 'text')
                .map((block) => block.text)
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            throw this.handleError(error, duration);
        }
    }
    async sendStreamRequest(options, callback) {
        if (!this.isAvailable()) {
            throw new types_1.AIServiceError('Anthropic provider is not configured', types_1.ErrorCode.PROVIDER_NOT_CONFIGURED, 'anthropic');
        }
        await this.checkRateLimit();
        const startTime = Date.now();
        try {
            const systemPrompt = this.extractSystemPrompt(options.messages, options.systemPrompt);
            const messages = this.convertMessages(options.messages);
            const stream = await this.client.messages.create({
                model: options.model,
                max_tokens: options.maxTokens || 4096,
                temperature: options.temperature,
                top_p: options.topP,
                system: systemPrompt,
                messages,
                stream: true,
            });
            let fullContent = '';
            let usage;
            let finishReason;
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
                }
                else if (event.type === 'message_delta') {
                    if (event.usage) {
                        usage = {
                            inputTokens: 0,
                            outputTokens: event.usage.output_tokens,
                            totalTokens: event.usage.output_tokens,
                        };
                    }
                    finishReason = event.delta.stop_reason || undefined;
                }
                else if (event.type === 'message_start') {
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            throw this.handleError(error, duration);
        }
    }
    handleError(error, duration) {
        let code = types_1.ErrorCode.UNKNOWN_ERROR;
        let statusCode;
        let message = 'An unknown error occurred';
        if (error instanceof sdk_1.default.APIError) {
            statusCode = error.status;
            message = error.message;
            if (error.status === 401) {
                code = types_1.ErrorCode.INVALID_API_KEY;
            }
            else if (error.status === 429) {
                code = types_1.ErrorCode.RATE_LIMIT_EXCEEDED;
            }
            else if (error.status !== undefined && error.status >= 400 && error.status < 500) {
                code = types_1.ErrorCode.INVALID_REQUEST;
            }
            else if (error.status !== undefined && error.status >= 500) {
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
        console.error(`Anthropic API error after ${duration}ms:`, {
            code,
            statusCode,
            message,
            originalError: error,
        });
        return new types_1.AIServiceError(message, code, 'anthropic', statusCode, error);
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
exports.AnthropicProvider = AnthropicProvider;
exports.default = AnthropicProvider;
