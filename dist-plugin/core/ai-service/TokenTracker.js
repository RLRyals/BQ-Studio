"use strict";
/**
 * TokenTracker - Tracks token usage and calculates costs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenTracker = void 0;
/**
 * Pricing information for different AI models (as of January 2025)
 * Prices are in USD per 1,000 tokens
 */
const MODEL_PRICING = {
    // Anthropic Claude models
    'claude-3-5-sonnet-20241022': {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015,
    },
    'claude-3-5-haiku-20241022': {
        inputCostPer1kTokens: 0.0008,
        outputCostPer1kTokens: 0.004,
    },
    'claude-3-opus-20240229': {
        inputCostPer1kTokens: 0.015,
        outputCostPer1kTokens: 0.075,
    },
    'claude-3-sonnet-20240229': {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015,
    },
    'claude-3-haiku-20240307': {
        inputCostPer1kTokens: 0.00025,
        outputCostPer1kTokens: 0.00125,
    },
    // OpenAI models
    'gpt-4-turbo-preview': {
        inputCostPer1kTokens: 0.01,
        outputCostPer1kTokens: 0.03,
    },
    'gpt-4-1106-preview': {
        inputCostPer1kTokens: 0.01,
        outputCostPer1kTokens: 0.03,
    },
    'gpt-4': {
        inputCostPer1kTokens: 0.03,
        outputCostPer1kTokens: 0.06,
    },
    'gpt-3.5-turbo-0125': {
        inputCostPer1kTokens: 0.0005,
        outputCostPer1kTokens: 0.0015,
    },
    'gpt-3.5-turbo': {
        inputCostPer1kTokens: 0.0015,
        outputCostPer1kTokens: 0.002,
    },
};
class TokenTracker {
    constructor() {
        this.totalInputTokens = 0;
        this.totalOutputTokens = 0;
        this.totalCost = 0;
        this.requestCount = 0;
    }
    /**
     * Calculate cost for a given token usage and model
     */
    calculateCost(usage, model) {
        const pricing = this.getModelPricing(model);
        const inputCost = (usage.inputTokens / 1000) * pricing.inputCostPer1kTokens;
        const outputCost = (usage.outputTokens / 1000) * pricing.outputCostPer1kTokens;
        const totalCost = inputCost + outputCost;
        return {
            inputCost: parseFloat(inputCost.toFixed(6)),
            outputCost: parseFloat(outputCost.toFixed(6)),
            totalCost: parseFloat(totalCost.toFixed(6)),
            currency: 'USD',
        };
    }
    /**
     * Get pricing information for a specific model
     */
    getModelPricing(model) {
        const pricing = MODEL_PRICING[model];
        if (!pricing) {
            console.warn(`Pricing not found for model ${model}, using default pricing`);
            return {
                inputCostPer1kTokens: 0.001,
                outputCostPer1kTokens: 0.002,
            };
        }
        return pricing;
    }
    /**
     * Track a request's token usage
     */
    trackUsage(usage, cost) {
        this.totalInputTokens += usage.inputTokens;
        this.totalOutputTokens += usage.outputTokens;
        this.totalCost += cost.totalCost;
        this.requestCount += 1;
    }
    /**
     * Get total usage statistics
     */
    getTotalUsage() {
        return {
            totalInputTokens: this.totalInputTokens,
            totalOutputTokens: this.totalOutputTokens,
            totalTokens: this.totalInputTokens + this.totalOutputTokens,
            totalCost: parseFloat(this.totalCost.toFixed(6)),
            requestCount: this.requestCount,
            averageCostPerRequest: this.requestCount > 0
                ? parseFloat((this.totalCost / this.requestCount).toFixed(6))
                : 0,
        };
    }
    /**
     * Reset all tracked statistics
     */
    reset() {
        this.totalInputTokens = 0;
        this.totalOutputTokens = 0;
        this.totalCost = 0;
        this.requestCount = 0;
    }
    /**
     * Estimate cost for a request before making it
     */
    estimateCost(inputTokens, outputTokens, model) {
        const usage = {
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
        };
        return this.calculateCost(usage, model);
    }
    /**
     * Get all available model pricing
     */
    getAllPricing() {
        return { ...MODEL_PRICING };
    }
    /**
     * Compare costs between models for a given token usage
     */
    compareCosts(usage) {
        const comparison = {};
        for (const model of Object.keys(MODEL_PRICING)) {
            comparison[model] = this.calculateCost(usage, model);
        }
        return comparison;
    }
}
exports.TokenTracker = TokenTracker;
exports.default = TokenTracker;
