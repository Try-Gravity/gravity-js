# Gravity JS SDK

The official Node.js/TypeScript SDK for the Gravity API.

## Installation

```bash
npm install @gravity-js/api
```

## Usage

First, import and initialize the client with your API key.

```typescript
import { Client } from '@gravity-js/api';

const client = new Client('YOUR_API_KEY');
```

### Fetching an Ad

To request an ad, you need to pass the conversation context (messages). You can also provide optional user or device information to improve targeting.

```typescript
const ad = await client.getAd({
  messages: [
    { role: 'user', content: 'I need help finding a new laptop.' },
    { role: 'assistant', content: 'What is your budget?' }
  ],
  // Optional: User context
  user: {
    gender: 'male',
    age: '25-34'
  }
});

if (ad) {
  console.log('Ad Text:', ad.adText);
  console.log('Impression URL:', ad.impUrl);
} else {
  console.log('No ad available for this context.');
}
```

### Advanced Configuration

You can override the default API endpoint or provide global excluded topics during initialization.

```typescript
const client = new Client('YOUR_API_KEY', {
  endpoint: 'https://custom.gravity.server',
  excludedTopics: ['politics', 'religion']
});
```

## License

MIT

