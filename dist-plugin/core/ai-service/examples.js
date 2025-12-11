"use strict";
/**
 * AI Service Usage Examples
 *
 * This file demonstrates how to use the AI Service in BQ Studio
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.example1_BasicSetup = example1_BasicSetup;
exports.example2_SimpleCompletion = example2_SimpleCompletion;
exports.example3_ChatConversation = example3_ChatConversation;
exports.example4_AdvancedRequest = example4_AdvancedRequest;
exports.example5_StreamingResponse = example5_StreamingResponse;
exports.example6_ProviderSwitching = example6_ProviderSwitching;
exports.example7_TokenTracking = example7_TokenTracking;
exports.example8_ErrorHandling = example8_ErrorHandling;
exports.example9_RateLimiting = example9_RateLimiting;
exports.example10_PromptTemplating = example10_PromptTemplating;
exports.example11_InteractionLogging = example11_InteractionLogging;
exports.example12_RetryLogic = example12_RetryLogic;
const index_1 = require("./index");
/**
 * Example 1: Basic Setup
 */
function example1_BasicSetup() {
    // Initialize the AI Service
    const aiService = new index_1.AIService();
    // Configure Anthropic provider
    aiService.configureProvider('anthropic', {
        apiKey: 'your-anthropic-api-key',
    });
    // Configure OpenAI provider
    aiService.configureProvider('openai', {
        apiKey: 'your-openai-api-key',
    });
    // Set default provider
    aiService.setDefaultProvider('anthropic');
    return aiService;
}
/**
 * Example 2: Simple Completion
 */
async function example2_SimpleCompletion() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
        defaultProvider: 'anthropic',
    });
    // Simple completion using the default provider
    const response = await aiService.complete('What is the capital of France?', 'claude-3-5-sonnet-20241022');
    console.log('Response:', response);
    console.log('Token Usage:', aiService.getTokenTracker().getTotalUsage());
}
/**
 * Example 3: Chat Conversation
 */
async function example3_ChatConversation() {
    const aiService = new index_1.AIService({
        openai: {
            apiKey: 'your-openai-api-key',
        },
        defaultProvider: 'openai',
    });
    const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello! How are you?' },
        { role: 'assistant', content: 'I am doing well, thank you!' },
        { role: 'user', content: 'Can you help me write a story?' },
    ];
    const response = await aiService.chat(messages, 'gpt-4-turbo-preview', 'openai');
    console.log('Chat Response:', response);
}
/**
 * Example 4: Advanced Request with Full Options
 */
async function example4_AdvancedRequest() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
        defaultProvider: 'anthropic',
    });
    const response = await aiService.sendRequest({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
            { role: 'user', content: 'Explain quantum computing in simple terms.' },
        ],
        maxTokens: 1000,
        temperature: 0.7,
        systemPrompt: 'You are an expert science educator.',
    });
    console.log('Content:', response.content);
    console.log('Token Usage:', response.usage);
    console.log('Cost:', response.cost);
    console.log('Model:', response.model);
    console.log('Provider:', response.provider);
    console.log('Finish Reason:', response.finishReason);
}
/**
 * Example 5: Streaming Response
 */
async function example5_StreamingResponse() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
        defaultProvider: 'anthropic',
    });
    console.log('Streaming response:');
    const response = await aiService.sendStreamRequest({
        model: 'claude-3-5-sonnet-20241022',
        messages: [
            { role: 'user', content: 'Write a short poem about coding.' },
        ],
        maxTokens: 500,
    }, (chunk) => {
        if (!chunk.done) {
            // Print each chunk as it arrives
            process.stdout.write(chunk.content);
        }
        else {
            // Final chunk with usage and cost
            console.log('\n\nFinal Usage:', chunk.usage);
            console.log('Final Cost:', chunk.cost);
        }
    });
    console.log('\n\nComplete Response:', response);
}
/**
 * Example 6: Provider Switching
 */
async function example6_ProviderSwitching() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
        openai: {
            apiKey: 'your-openai-api-key',
        },
        defaultProvider: 'anthropic',
    });
    // Use Anthropic (default)
    const claudeResponse = await aiService.complete('What is AI?', 'claude-3-5-sonnet-20241022');
    console.log('Claude says:', claudeResponse);
    // Explicitly use OpenAI
    const gptResponse = await aiService.complete('What is AI?', 'gpt-4-turbo-preview', 'openai');
    console.log('GPT says:', gptResponse);
    // Check provider status
    console.log('Provider Status:', aiService.getProviderStatus());
}
/**
 * Example 7: Token Tracking and Cost Analysis
 */
async function example7_TokenTracking() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
    });
    const tokenTracker = aiService.getTokenTracker();
    // Make several requests
    await aiService.complete('Hello!', 'claude-3-5-sonnet-20241022');
    await aiService.complete('How are you?', 'claude-3-5-sonnet-20241022');
    await aiService.complete('What is 2+2?', 'claude-3-5-sonnet-20241022');
    // Get total usage
    const totalUsage = tokenTracker.getTotalUsage();
    console.log('Total Usage:', totalUsage);
    // Compare costs between models
    const comparison = tokenTracker.compareCosts({
        inputTokens: 1000,
        outputTokens: 1000,
        totalTokens: 2000,
    });
    console.log('Cost Comparison:', comparison);
    // Get pricing for all models
    const allPricing = tokenTracker.getAllPricing();
    console.log('All Model Pricing:', allPricing);
}
/**
 * Example 8: Error Handling
 */
async function example8_ErrorHandling() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'invalid-api-key',
        },
    });
    try {
        await aiService.complete('Hello!', 'claude-3-5-sonnet-20241022');
    }
    catch (error) {
        console.error('Error Type:', error.name);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Provider:', error.provider);
        console.error('Status Code:', error.statusCode);
    }
}
/**
 * Example 9: Rate Limiting
 */
async function example9_RateLimiting() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
            rateLimit: {
                requestsPerMinute: 10,
                tokensPerMinute: 100000,
            },
        },
    });
    // Make multiple requests - they will be automatically rate limited
    for (let i = 0; i < 15; i++) {
        const start = Date.now();
        await aiService.complete(`Request ${i + 1}`, 'claude-3-5-sonnet-20241022');
        const duration = Date.now() - start;
        console.log(`Request ${i + 1} took ${duration}ms`);
    }
}
/**
 * Example 10: Prompt Templating
 */
async function example10_PromptTemplating() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
    });
    // Define a template
    const template = `You are a {{role}}.
Your task is to {{task}}.
The context is: {{context}}`;
    // Apply template with variables
    const prompt = aiService.applyTemplate(template, {
        role: 'creative writer',
        task: 'write a short story about a robot',
        context: 'the story should be suitable for children',
    });
    console.log('Generated Prompt:', prompt);
    const response = await aiService.complete(prompt, 'claude-3-5-sonnet-20241022');
    console.log('Response:', response);
}
/**
 * Example 11: Interaction Logging
 */
async function example11_InteractionLogging() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
    });
    // Make some requests
    await aiService.complete('Hello!', 'claude-3-5-sonnet-20241022');
    await aiService.complete('How are you?', 'claude-3-5-sonnet-20241022');
    // Get interaction logs
    const logs = aiService.getInteractionLogs();
    console.log('Interaction Logs:', logs);
    // Clear logs
    aiService.clearInteractionLogs();
    console.log('Logs after clearing:', aiService.getInteractionLogs());
}
/**
 * Example 12: Retry Logic with Exponential Backoff
 */
async function example12_RetryLogic() {
    const aiService = new index_1.AIService({
        anthropic: {
            apiKey: 'your-anthropic-api-key',
        },
        retryAttempts: 5,
        retryDelay: 1000,
    });
    // If the request fails (e.g., network error), it will automatically retry
    // with exponential backoff
    try {
        const response = await aiService.complete('Hello!', 'claude-3-5-sonnet-20241022');
        console.log('Response after retries:', response);
    }
    catch (error) {
        console.error('Failed after all retry attempts:', error);
    }
}
