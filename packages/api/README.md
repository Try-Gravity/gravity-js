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

// Contextual ads (v1 API)
const response = await client.contextualAd({
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

## v1 API Methods

The v1 API provides explicit endpoints for different ad types with multi-ad support.

### `contextualAd()` — Contextual Ads

Fetch ads based on conversation context. Requires `messages` array.

```typescript
const response = await client.contextualAd({
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

#### Full Request with All Options

```typescript
const response = await client.contextualAd({
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

### `summaryAd()` — Summary-Based Ads

Fetch ads based on a search query or summary string. Requires `queryString`.

```typescript
const response = await client.summaryAd({
  queryString: 'User wants a laptop for software development',
  sessionId: 'session-123',
  userId: 'user-456',
});

if (response) {
  const ad = response.ads[0];
  console.log(ad.adText);
}
```

### `nonContextualAd()` — Non-Contextual Ads

Fetch ads without context matching. Ideal for:
- **Integration testing** — Test your ad implementation on a subset of users before rolling out contextual ads
- **Brand awareness** — Show ads without requiring conversation context
- **Fallback placements** — Ad slots where context isn't available

```typescript
const response = await client.nonContextualAd({
  sessionId: 'session-123',
  userId: 'user-456',
  numAds: 2,  // Request multiple ads
});

if (response) {
  response.ads.forEach(ad => console.log(ad.adText));
}
```

### `bid()` + `render()` — Two-Phase Flow

For publishers who need to know the clearing price before rendering the ad.

```typescript
// Phase 1: Get bid price
const bidResult = await client.bid({
  messages: [
    { role: 'user', content: 'I need help with my code' }
  ],
  sessionId: 'session-123',
});

if (bidResult) {
  console.log(`Clearing price: $${bidResult.bid} CPM`);
  console.log(`Bid ID: ${bidResult.bidId}`);
  
  // Decide whether to show ad based on price...
  
  // Phase 2: Render the ad
  const response = await client.render({
    bidId: bidResult.bidId,
    realizedPrice: bidResult.bid,
  });
  
  if (response) {
    const ad = response.ads[0];
    console.log(ad.adText);
  }
}
```

> **Note:** Bids expire after 60 seconds. Call `render()` promptly after `bid()`.

---

## v1 Request Parameters

### Base Parameters (All v1 Methods)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | `string` | Recommended | Session identifier for tracking |
| `userId` | `string` | Recommended | User identifier for frequency capping |
| `device` | `DeviceObject` | - | Device/location info |
| `user` | `UserObject` | - | User targeting info |
| `excludedTopics` | `string[]` | - | Topics to exclude |
| `relevancy` | `number` | - | Min relevancy (0-1) |
| `numAds` | `number` | - | Number of ads (1-3, default 1) |
| `testAd` | `boolean` | - | Return test ad when true |

### Method-Specific Parameters

| Method | Required Parameter | Description |
|--------|-------------------|-------------|
| `contextualAd()` | `messages: MessageObject[]` | Conversation history |
| `summaryAd()` | `queryString: string` | Search/summary query |
| `nonContextualAd()` | None | No context required |
| `bid()` | `messages: MessageObject[]` | Conversation for bid |
| `render()` | `bidId: string`, `realizedPrice: number` | From bid response |

---

## v1 Response Types

### AdResponseV1

Returned by `contextualAd()`, `summaryAd()`, `nonContextualAd()`, and `render()`.

```typescript
interface AdResponseV1 {
  ads: AdV1[];           // Array of ads
  numAds: number;        // Number of ads returned
  totalPayout?: number;  // Total payout across all ads
}

interface AdV1 {
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

### BidResponse

Returned by `bid()`.

```typescript
interface BidResponse {
  bid: number;     // Clearing price (CPM)
  bidId: string;   // Use this in render()
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

## Legacy API (v0)

The original `getAd()` method is still available for backward compatibility.

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
  messages: [...],
  user: { uid: 'user-123', gender: 'male', age: '25-34' },
  device: { ip: '1.2.3.4', country: 'US', ua: 'Mozilla/5.0...' },
  excludedTopics: ['politics'],
  relevancy: 0.8,
});
```

### Legacy Response

```typescript
interface AdResponse {
  adText: string;       // The ad copy to display
  impUrl?: string;      // Impression tracking URL
  clickUrl?: string;    // Click-through URL
  payout?: number;      // Payout amount
}
```

### Handling the Legacy Response

```typescript
const ad = await client.getAd({ messages });

if (ad) {
  console.log('Ad:', ad.adText);
  
  // Track impression
  if (ad.impUrl) {
    fetch(ad.impUrl);
  }
} else {
  console.log('No ad available');
}
```

## Error Handling

The client handles errors gracefully and returns `null` on failure. Errors are logged to the console.

```typescript
const response = await client.contextualAd({ messages, sessionId: '...' });

// Returns null on:
// - Network errors
// - API errors (4xx, 5xx)
// - No relevant ad (204)
// - Invalid response data
// - Expired bid (404 for render())

if (!response) {
  // Handle gracefully - don't break the user experience
}
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import { Client, ClientParams } from '@gravity-ai/api';
import type { 
  // v1 types
  ContextualAdParams,
  SummaryAdParams,
  NonContextualAdParams,
  BidParams,
  RenderParams,
  AdV1,
  AdResponseV1,
  BidResponse,
  // Common types
  MessageObject, 
  DeviceObject, 
  UserObject,
  // Legacy types
  AdParams, 
  AdResponse,
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
    client.contextualAd({ 
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

2. **Choose the right method**:
   - Chat/conversation → `contextualAd()`
   - Chat summary → `summaryAd()`
   - Brand awareness → `nonContextualAd()`
   - Custom auction → `bid()` + `render()`

3. **Handle null responses gracefully** — Don't break the user experience when no ad is available.

4. **Fire impression url** — Use the `impUrl` when the ad becomes visible to properly track impressions.

## License

MIT
