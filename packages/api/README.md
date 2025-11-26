# @gravity-ai/api

The official Node.js/TypeScript SDK for the Gravity AI advertising API. Fetch contextually relevant ads based on conversation content.

## Installation

```bash
npm install @gravity-ai/api
```

> **Note:** Requires Node.js 18+

## Quick Start

```typescript
import { Client } from '@gravity-ai/api';

const client = new Client('your-api-key');

const ad = await client.getAd({
  messages: [
    { role: 'user', content: 'What are some good hiking trails?' },
    { role: 'assistant', content: 'Here are some popular trails...' }
  ]
});

if (ad) {
  console.log(ad.adText);
}
```

## Client Configuration

### Basic Initialization

```typescript
import { Client } from '@gravity-ai/api';

const client = new Client('your-api-key');
```

### Advanced Configuration

```typescript
import { Client } from '@gravity-ai/api';

const client = new Client('your-api-key', {
  // Topics to exclude globally (optional)
  excludedTopics: ['politics', 'religion'],
  
  // Minimum relevancy threshold 0-1 (optional)
  relevancy: 0.8,
});
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | `string` | `'https://server.trygravity.ai'` | API endpoint URL |
| `excludedTopics` | `string[]` | `[]` | Topics to exclude from ad matching |
| `relevancy` | `number \| null` | `null` | Minimum relevancy score (0-1) |

## Fetching Ads

### Basic Request

```typescript
const ad = await client.getAd({
  messages: [
    { role: 'user', content: 'I need help finding a new laptop.' },
    { role: 'assistant', content: 'What is your budget?' }
  ]
});
```

### Full Request with All Options

```typescript
const ad = await client.getAd({
  // Required: conversation messages
  messages: [
    { role: 'user', content: 'I need help finding a new laptop.' },
    { role: 'assistant', content: 'What is your budget?' }
  ],
  
  // Optional: user information for targeting
  user: {
    uid: 'user-123',           // Unique user identifier
    gender: 'male',            // 'male' | 'female' | 'other'
    age: '25-34',              // Age range string
    keywords: 'tech,gadgets',  // User interest keywords
  },
  
  // Optional: device information
  device: {
    ip: '1.2.3.4',             // User IP address
    country: 'US',             // ISO country code
    ua: 'Mozilla/5.0...',      // User agent string
    os: 'macOS',               // Operating system
    ifa: 'device-ad-id',       // Advertising identifier
  },
  
  // Optional: additional targeting context
  excludedTopics: ['politics'],  // Override client-level exclusions
  relevancy: 0.8,                // Override client-level relevancy
  
  // Optional: custom fields (open-ended)
  interests: ['coding', 'apple', 'software development'],
  summary: 'User wants a laptop for software development',
});
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | `MessageObject[]` | ✅ | Conversation history |
| `user` | `UserObject` | - | User targeting info |
| `device` | `DeviceObject` | - | Device/location info |
| `excludedTopics` | `string[]` | - | Topics to exclude |
| `relevancy` | `number` | - | Min relevancy (0-1) |
| `apiKey` | `string` | - | Override client API key |
| `[key: string]` | `any` | - | Custom fields allowed |

### Message Object

```typescript
interface MessageObject {
  role: 'user' | 'assistant';
  content: string;
}
```

### User Object

```typescript
interface UserObject {
  uid?: string;                              // Unique user ID
  gender?: 'male' | 'female' | 'other';      // User gender
  age?: string;                              // Age range (e.g., '25-34')
  keywords?: string;                         // Interest keywords
}
```

### Device Object

```typescript
interface DeviceObject {
  ip: string;          // IP address
  country: string;     // ISO country code
  ua: string;          // User agent
  os?: string;         // Operating system
  ifa?: string;        // Advertising ID
}
```

## Ad Response

The `getAd` method returns an `AdResponse` object or `null` if no relevant ad is found.

```typescript
interface AdResponse {
  adText: string;       // The ad copy to display
  impUrl?: string;      // Impression tracking URL (fire on view)
  clickUrl?: string;    // Click-through URL
  payout?: number;      // Payout amount
}
```

### Handling the Response

```typescript
const ad = await client.getAd({ messages });

if (ad) {
  // Display the ad
  console.log('Ad:', ad.adText);
  
  // Track impression (fire pixel)
  if (ad.impUrl) {
    fetch(ad.impUrl); // or use an image beacon
  }
  
  // Handle clicks
  if (ad.clickUrl) {
    // Navigate user to ad.clickUrl on click
  }
} else {
  // No relevant ad found - show fallback or nothing
  console.log('No ad available');
}
```

## Error Handling

The client handles errors gracefully and returns `null` on failure. Errors are logged to the console.

```typescript
const ad = await client.getAd({ messages });

// Returns null on:
// - Network errors
// - API errors (4xx, 5xx)
// - No relevant ad (204)
// - Invalid response data

if (!ad) {
  // Handle gracefully - don't break the user experience
}
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import { Client, ClientParams } from '@gravity-ai/api';
import type { AdParams, AdResponse, MessageObject, DeviceObject, UserObject } from '@gravity-ai/api';
```

## Using with React

For React applications, consider using the companion package `@gravity-ai/react` which provides ready-to-use components with automatic tracking:

```bash
npm install @gravity-ai/api @gravity-ai/react
```

```tsx
import { Client } from '@gravity-ai/api';
import { AdBanner } from '@gravity-ai/react';

const client = new Client('your-api-key');

function ChatApp() {
  const [ad, setAd] = useState(null);
  
  useEffect(() => {
    client.getAd({ messages }).then(setAd);
  }, [messages]);

  return <AdBanner ad={ad} theme="dark" />;
}
```

## License

MIT
