# AI Service for BQ Studio

Multi-provider AI service with support for Anthropic Claude and OpenAI GPT models.

## Features

- **Multi-Provider Support**: Switch between Anthropic Claude and OpenAI seamlessly
- **Streaming & Non-Streaming**: Full support for both streaming and non-streaming responses
- **Token Tracking**: Comprehensive token usage tracking with cost calculation
- **Rate Limiting**: Built-in rate limiting to respect API quotas
- **Retry Logic**: Automatic retry with exponential backoff for transient errors
- **Secure Storage**: API keys encrypted using electron-store
- **Interaction Logging**: Detailed logging for debugging and analytics
- **Prompt Templating**: Simple template system for reusable prompts
- **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

The required dependencies are already included in the project:
- `@anthropic-ai/sdk`
- `openai`
- `electron-store`

## Quick Start

```typescript
import { AIService } from '@core/ai-service';

// Initialize the service
const aiService = new AIService();

// Configure providers
aiService.configureProvider('anthropic', {
  apiKey: 'your-anthropic-api-key',
});

aiService.configureProvider('openai', {
  apiKey: 'your-openai-api-key',
});

// Set default provider
aiService.setDefaultProvider('anthropic');

// Make a simple request
const response = await aiService.complete(
  'What is the capital of France?',
  'claude-3-5-sonnet-20241022'
);

console.log(response);
```

## Usage Examples

### Basic Completion

```typescript
const response = await aiService.complete(
  'Explain quantum computing',
  'claude-3-5-sonnet-20241022'
);
```

### Chat Conversation

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help?' },
  { role: 'user', content: 'Tell me a joke.' },
];

const response = await aiService.chat(
  messages,
  'claude-3-5-sonnet-20241022'
);
```

### Advanced Request

```typescript
const response = await aiService.sendRequest({
  model: 'claude-3-5-sonnet-20241022',
  messages: [
    { role: 'user', content: 'Write a poem about coding' },
  ],
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
  systemPrompt: 'You are a creative poet.',
});

console.log('Content:', response.content);
console.log('Usage:', response.usage);
console.log('Cost:', response.cost);
```

### Streaming Response

```typescript
const response = await aiService.sendStreamRequest(
  {
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: 'Write a story' }],
  },
  (chunk) => {
    if (!chunk.done) {
      // Handle each chunk of content
      process.stdout.write(chunk.content);
    } else {
      // Handle final chunk with usage data
      console.log('\nUsage:', chunk.usage);
      console.log('Cost:', chunk.cost);
    }
  }
);
```

### Provider Switching

```typescript
// Use default provider (Anthropic)
const claude = await aiService.complete(
  'Hello!',
  'claude-3-5-sonnet-20241022'
);

// Explicitly use OpenAI
const gpt = await aiService.complete(
  'Hello!',
  'gpt-4-turbo-preview',
  'openai'
);
```

## Token Tracking and Cost Calculation

The AI Service includes comprehensive token tracking and cost calculation:

```typescript
const tokenTracker = aiService.getTokenTracker();

// Get total usage across all requests
const totalUsage = tokenTracker.getTotalUsage();
console.log('Total tokens used:', totalUsage.totalTokens);
console.log('Total cost:', totalUsage.totalCost);
console.log('Average cost per request:', totalUsage.averageCostPerRequest);

// Compare costs between models
const comparison = tokenTracker.compareCosts({
  inputTokens: 1000,
  outputTokens: 1000,
  totalTokens: 2000,
});

// Estimate cost before making a request
const estimate = tokenTracker.estimateCost(
  1000, // input tokens
  1000, // output tokens
  'claude-3-5-sonnet-20241022'
);
```

## Supported Models

### Anthropic Claude
- `claude-3-5-sonnet-20241022` - Latest Sonnet model
- `claude-3-5-haiku-20241022` - Fast and efficient
- `claude-3-opus-20240229` - Most capable
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-haiku-20240307` - Fastest

### OpenAI GPT
- `gpt-4-turbo-preview` - Latest GPT-4 Turbo
- `gpt-4-1106-preview` - GPT-4 Turbo
- `gpt-4` - GPT-4 base
- `gpt-3.5-turbo-0125` - Latest GPT-3.5
- `gpt-3.5-turbo` - GPT-3.5 base

## Rate Limiting

Configure rate limiting to respect API quotas:

```typescript
aiService.configureProvider('anthropic', {
  apiKey: 'your-api-key',
  rateLimit: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,
  },
});
```

## Error Handling

The service includes comprehensive error handling:

```typescript
import { AIServiceError, ErrorCode } from '@core/ai-service';

try {
  const response = await aiService.complete('Hello!', 'claude-3-5-sonnet-20241022');
} catch (error) {
  if (error instanceof AIServiceError) {
    switch (error.code) {
      case ErrorCode.INVALID_API_KEY:
        console.error('Invalid API key');
        break;
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        console.error('Rate limit exceeded');
        break;
      case ErrorCode.SERVER_ERROR:
        console.error('Server error');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## Retry Logic

Automatic retry with exponential backoff:

```typescript
const aiService = new AIService({
  retryAttempts: 3,    // Max retry attempts
  retryDelay: 1000,    // Initial delay in ms
});
```

The service will automatically retry on:
- Network errors
- Rate limit errors (429)
- Server errors (5xx)

It will NOT retry on:
- Invalid API key (401)
- Invalid request (400)

## Interaction Logging

All interactions are logged for debugging and analytics:

```typescript
// Get interaction logs
const logs = aiService.getInteractionLogs();

logs.forEach(log => {
  console.log('Request ID:', log.id);
  console.log('Provider:', log.provider);
  console.log('Model:', log.model);
  console.log('Duration:', log.duration);
  console.log('Cost:', log.response.cost);
  console.log('Error:', log.error?.message);
});

// Clear logs
aiService.clearInteractionLogs();
```

## Prompt Templating

Simple template system for reusable prompts:

```typescript
const template = `You are a {{role}}.
Your task is to {{task}}.
Context: {{context}}`;

const prompt = aiService.applyTemplate(template, {
  role: 'creative writer',
  task: 'write a short story',
  context: 'about a robot learning to paint',
});
```

## Provider Status

Check which providers are configured:

```typescript
const status = aiService.getProviderStatus();
console.log('Anthropic available:', status.anthropic);
console.log('OpenAI available:', status.openai);
console.log('Default provider:', status.defaultProvider);
```

## API Reference

### AIService

Main service class for interacting with AI providers.

#### Methods

- `configureProvider(provider, config)` - Configure a provider
- `setDefaultProvider(provider)` - Set the default provider
- `sendRequest(options, provider?)` - Send a request
- `sendStreamRequest(options, callback, provider?)` - Send a streaming request
- `complete(prompt, model, provider?)` - Simple completion
- `chat(messages, model, provider?)` - Chat completion
- `applyTemplate(template, variables)` - Apply prompt template
- `getTokenTracker()` - Get token tracker instance
- `getProviderStatus()` - Get provider status
- `getInteractionLogs()` - Get interaction logs
- `clearInteractionLogs()` - Clear interaction logs

### TokenTracker

Tracks token usage and calculates costs.

#### Methods

- `calculateCost(usage, model)` - Calculate cost for usage
- `trackUsage(usage, cost)` - Track a request's usage
- `getTotalUsage()` - Get total usage statistics
- `reset()` - Reset all statistics
- `estimateCost(inputTokens, outputTokens, model)` - Estimate cost
- `getAllPricing()` - Get all model pricing
- `compareCosts(usage)` - Compare costs between models

## Architecture

```
src/core/ai-service/
├── AIService.ts              # Main service orchestrator
├── TokenTracker.ts           # Token tracking and cost calculation
├── types.ts                  # TypeScript type definitions
├── providers/
│   ├── AnthropicProvider.ts  # Anthropic Claude integration
│   └── OpenAIProvider.ts     # OpenAI GPT integration
├── index.ts                  # Public API exports
├── examples.ts               # Usage examples
└── README.md                 # This file
```

## Security

- API keys are encrypted using electron-store
- Keys are stored securely in the user's local filesystem
- Never commit API keys to version control
- Use environment variables for CI/CD

## Performance

- Streaming responses reduce perceived latency
- Rate limiting prevents API quota exhaustion
- Retry logic handles transient failures
- Token tracking helps optimize costs

## Contributing

When adding new features:
1. Update type definitions in `types.ts`
2. Implement in appropriate provider
3. Add tests
4. Update documentation
5. Add usage examples

## License

MIT
