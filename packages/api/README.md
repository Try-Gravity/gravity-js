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

const response = await client.getAd({
  messages: [
    { role: 'user', content: 'What are some good hiking trails?' },
    { role: 'assistant', content: 'Here are some popular trails...' }
  ],
  sessionId: 'session-123',  // Recommended
  userId: 'user-456',        // Recommended
});

if (response) {
  const ad = response.ads[0];
  console.log(ad.adText);
}
```

## Migrating from v0

If you're upgrading from a previous version, the `getAd()` response format has changed:

```typescript
// Before (v0)
const ad = await client.getAd({ messages });
if (ad) {
  console.log(ad.adText);
}

// After (v1)
const response = await client.getAd({ messages, sessionId: '...' });
if (response) {
  const ad = response.ads[0];
  console.log(ad.adText);
}
```

The response is now an object with an `ads` array instead of a single ad object.

---

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

---

## `getAd()` — Fetch Contextual Ads

Fetch ads based on conversation context. Requires `messages` array.

```typescript
const response = await client.getAd({
  messages: [
    { role: 'user', content: 'I need help finding a new laptop.' },
    { role: 'assistant', content: 'What is your budget?' }
  ],
  sessionId: 'session-123',  // Recommended
  userId: 'user-456',        // Recommended
  numAds: 1,                 // 1-3, default 1
});

if (response) {
  const ad = response.ads[0];
  console.log(ad.adText);
}
```

### Full Request with All Options

```typescript
const response = await client.getAd({
  // Required: conversation messages
  messages: [
    { role: 'user', content: 'I need help finding a new laptop.' },
    { role: 'assistant', content: 'What is your budget?' }
  ],
  
  // Recommended: session/user tracking (improves ad relevance & revenue)
  sessionId: 'session-123',
  userId: 'user-456',
  
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
  
  // Optional: ad request settings
  excludedTopics: ['politics'],  // Topics to exclude
  relevancy: 0.8,                // Min relevancy threshold (0-1)
  numAds: 1,                     // Number of ads (1-3)
  testAd: false,                 // Return test ad when true
  
  // Optional: custom fields (open-ended, passed to matching)
  interests: ['coding', 'apple', 'software development'],
  summary: 'User wants a laptop for software development',
});
```

---

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | `MessageObject[]` | Yes | Conversation history |
| `sessionId` | `string` | Recommended | Session identifier for tracking |
| `userId` | `string` | Recommended | User identifier for frequency capping |
| `device` | `DeviceObject` | - | Device/location info |
| `user` | `UserObject` | - | User targeting info |
| `excludedTopics` | `string[]` | - | Topics to exclude |
| `relevancy` | `number` | - | Min relevancy (0-1) |
| `numAds` | `number` | - | Number of ads (1-3, default 1) |
| `testAd` | `boolean` | - | Return test ad when true |

---

## Response Types

### AdResponse

Returned by `getAd()`.

```typescript
interface AdResponse {
  ads: Ad[];           // Array of ads
  numAds: number;        // Number of ads returned
  totalPayout?: number;  // Total payout across all ads
}

interface Ad {
  adText: string;        // Ad copy text
  adId: string;          // Unique ad identifier
  title?: string;        // Ad title
  brandName?: string;    // Brand name
  brandImage?: string;   // Brand logo URL
  url?: string;          // Landing page URL
  favicon?: string;      // Favicon URL
  impUrl?: string;       // Impression tracking URL
  clickUrl?: string;     // Click-through URL
  payout?: number;       // Payout amount
}
```

---

## Common Types

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

---

## Error Handling

The client handles errors gracefully and returns `null` on failure. Errors are logged to the console.

```typescript
const response = await client.getAd({ messages, sessionId: '...' });

// Returns null on:
// - Network errors
// - API errors (4xx, 5xx)
// - No relevant ad (204)
// - Invalid response data

if (!response) {
  // Handle gracefully - don't break the user experience
}
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import { Client, ClientParams } from '@gravity-ai/api';
import type { 
  AdParams,
  Ad,
  AdResponse,
  MessageObject, 
  DeviceObject, 
  UserObject,
} from '@gravity-ai/api';
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
    client.getAd({ 
      messages,
      sessionId: 'session-123',
      userId: 'user-456',
    }).then(res => setAd(res?.ads[0] || null));
  }, [messages]);

  return <AdBanner ad={ad} theme="dark" />;
}
```

## Best Practices

1. **Always include `sessionId` and `userId`** — These directly impact publisher revenue through better frequency capping and ad relevance.

2. **Handle null responses gracefully** — Don't break the user experience when no ad is available.

3. **Fire impression url** — Use the `impUrl` when the ad becomes visible to properly track impressions.

## License

MIT
