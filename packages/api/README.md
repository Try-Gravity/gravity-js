# @gravity-ai/api

The official Node.js/TypeScript SDK for the Gravity AI advertising API. Fetch contextually relevant ads based on conversation content.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Migrating from v0](#migrating-from-v0)
- [Client Configuration](#client-configuration)
- [Integration Types](#integration-types)
  - [Web](#web)
  - [IDE / CLI](#ide--cli)
  - [Mobile](#mobile)
  - [General](#general)
- [Response Types](#response-types)
- [Error Handling](#error-handling)
- [Using with React](#using-with-react)
- [Best Practices](#best-practices)

---

## Installation

```bash
npm install @gravity-ai/api
```

> **Note:** Requires Node.js 18+

---

## Quick Start

```typescript
import { Client } from '@gravity-ai/api';

const client = new Client('your-api-key');

const response = await client.getAd({
  messages: [
    { role: 'user', content: 'What are some good hiking trails?' },
  ],
  sessionId: 'session-123',  // Required
  userId: 'user-456',
  testAd: true,              // Use for testing
});

if (response) {
  const ad = response.ads[0];
  console.log(ad.adText);
}
```

---

## Migrating from v0

If you're upgrading from a previous version, there are two key changes:

**1. `sessionId` is now required**
```typescript
const response = await client.getAd({
  messages: [...],
  sessionId: 'session-123',  // Required in v1
});
```

**2. Response format changed**
```typescript
// Before (v0) - single ad object
const ad = await client.getAd({ messages });

// After (v1) - response with ads array
const response = await client.getAd({ messages, sessionId: '...' });
const ad = response?.ads[0];
```

---

## Client Configuration

```typescript
import { Client } from '@gravity-ai/api';

// Basic
const client = new Client('your-api-key');

// Advanced
const client = new Client('your-api-key', {
  excludedTopics: ['politics', 'religion'],  // Global exclusions
  relevancy: 0.6,                            // Min relevancy threshold (0.1-1)
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | `string` | `'https://server.trygravity.ai'` | API endpoint URL |
| `excludedTopics` | `string[]` | `[]` | Topics to exclude from ad matching |
| `relevancy` | `number` | `null` | Minimum relevancy score (0.1-1) |

---

## Integration Types

Choose the integration type that matches your application. All types share these **required fields**:

| Field | Type | Description |
|-------|------|-------------|
| `messages` | `MessageObject[]` | Conversation context. Array of `{role, content}` objects. |
| `sessionId` | `string` | Session identifier for frequency capping. **Required.** |

And these **recommended fields**:

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | Unique user identifier. |
| `testAd` | `boolean` | Returns real ad without tracking. Use for testing. |

---

### Web

**For:** Chat interfaces, AI assistants, web apps with conversational UI

#### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `device.ip` | `string` | IP address for geo-targeting. **Required when `device` included.** |
| `device.ua` | `string` | User agent string. Enables browser/device detection. |
| `device.browser` | `string` | `"chrome"`, `"safari"`, `"firefox"`. Enables browser targeting. |
| `device.device_type` | `string` | `"desktop"`, `"mobile"`, `"tablet"`. |
| `device.timezone` | `string` | IANA timezone (e.g., `"America/New_York"`). |
| `device.locale` | `string` | Browser locale (e.g., `"en-US"`). |
| `user.email` | `string` | User's email for identity matching. **Higher CPMs.** |
| `user.subscription_tier` | `string` | `"free"`, `"pro"`, `"enterprise"`. Premium users = higher value. |
| `web.referrer` | `string` | Referring URL. Enables traffic source targeting. |
| `ui.max_ad_length` | `number` | Max characters for ad text. |
| `ui.placement` | `string` | `"inline"`, `"sidebar"`, `"banner"`, `"start_of_response"`, `"end_of_response"` |

#### Example

```typescript
const response = await client.getAd({
  messages: [
    { role: 'user', content: 'What are the best practices for React performance?' }
  ],
  sessionId: 'session-web-001',
  userId: 'user-web-789',
  testAd: true,
  user: {
    email: 'webuser@example.com',
    subscription_tier: 'pro'
  },
  device: {
    ip: '203.0.113.50',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    browser: 'chrome',
    device_type: 'desktop',
    timezone: 'Europe/London',
    locale: 'en-GB'
  },
  web: {
    referrer: 'https://google.com'
  },
  ui: {
    max_ad_length: 200,
    placement: 'sidebar'
  }
});
```

---

### IDE / CLI

**For:** Cursor, Claude Code, GitHub Copilot, Windsurf, VS Code extensions, terminal tools

#### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `device.ip` | `string` | IP address for geo-targeting. **Required when `device` included.** |
| `device.os` | `string` | `"macos"`, `"windows"`, `"linux"`. |
| `device.timezone` | `string` | IANA timezone (e.g., `"America/New_York"`). |
| `device.locale` | `string` | Locale (e.g., `"en-US"`). |
| `user.email` | `string` | User's email for identity matching. **Higher CPMs.** |
| `ide.name` | `string` | IDE name: `"cursor"`, `"vscode"`, `"intellij"`. |
| `ide.version` | `string` | IDE version. |
| `ide.extension_version` | `string` | Your extension version. |
| `ide.active_language` | `string` | Current file language (e.g., `"typescript"`). |
| `ui.max_ad_length` | `number` | Max characters for ad text. |
| `ui.placement` | `string` | `"inline"`, `"banner"`, `"start_of_response"`, `"end_of_response"` |
| `ui.dark_mode` | `boolean` | Whether dark mode is active. |
| `ui.supports_markdown` | `boolean` | Whether markdown rendering is supported. |
| `ui.supports_links` | `boolean` | Whether clickable links are supported. |

#### Example

```typescript
const response = await client.getAd({
  messages: [
    { role: 'user', content: 'How do I set up authentication in my Express app?' }
  ],
  sessionId: 'session-ide-001',
  userId: 'user-dev-123',
  testAd: true,
  user: {
    uid: 'usr_dev123',
    email: 'developer@example.com'
  },
  device: {
    ip: '192.168.1.100',
    os: 'macos',
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  ide: {
    name: 'cursor',
    version: '0.40.0',
    extension_version: '1.2.3',
    active_language: 'typescript'
  },
  ui: {
    max_ad_length: 150,
    placement: 'end_of_response',
    dark_mode: true,
    supports_markdown: true,
    supports_links: true
  }
});
```

---

### Mobile

**For:** iOS apps, Android apps, React Native, Flutter

#### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `device.ip` | `string` | IP address for geo-targeting. **Required when `device` included.** |
| `device.ua` | `string` | User agent (e.g., `"MyApp/2.1.0 (iPhone; iOS 17.2)"`). |
| `device.os` | `string` | `"iOS"` or `"Android"`. Enables platform-specific ads. |
| `device.os_version` | `string` | OS version (e.g., `"17.2"`). |
| `device.device_model` | `string` | Device model (e.g., `"iPhone 15 Pro"`). |
| `device.ifa` | `string` | IDFA/GAID for cross-app attribution. **Higher CPMs.** |
| `device.timezone` | `string` | IANA timezone. |
| `device.locale` | `string` | Device locale. |
| `device.connection_type` | `string` | `"wifi"`, `"cellular"`, `"offline"`. |
| `user.email` | `string` | User's email for identity matching. **Higher CPMs.** |
| `user.subscription_tier` | `string` | `"free"`, `"premium"`. Premium users = higher value. |
| `user.user_created_at` | `string` | Account creation date. New vs established users. |
| `user.user_interests` | `string[]` | User interests for targeting. |
| `app.version` | `string` | Your app version. |
| `ui.max_ad_length` | `number` | Max characters for ad text. |
| `ui.placement` | `string` | `"inline"`, `"banner"`, `"interstitial"`, `"start_of_response"`, `"end_of_response"` |
| `ui.dark_mode` | `boolean` | Whether dark mode is active. |
| `ui.supports_images` | `boolean` | Whether images can be displayed. |
| `ui.supports_cta_button` | `boolean` | Whether CTA buttons are supported. |

#### Example

```typescript
const response = await client.getAd({
  messages: [
    { role: 'assistant', content: 'I found several Italian restaurants nearby.' },
    { role: 'user', content: 'Which one has the best pasta?' }
  ],
  sessionId: 'session-mobile-001',
  userId: 'user-app-456',
  testAd: true,
  user: {
    uid: 'usr_mobile456',
    email: 'user@example.com',
    subscription_tier: 'premium',
    user_created_at: '2023-06-15T00:00:00Z',
    user_interests: ['food', 'dining', 'travel']
  },
  device: {
    ip: '10.0.0.50',
    ua: 'MyApp/2.1.0 (iPhone; iOS 17.2)',
    os: 'iOS',
    os_version: '17.2',
    device_model: 'iPhone 15 Pro',
    ifa: '6D92078A-8246-4BA4-AE5B-76104861E7DC',
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    connection_type: 'wifi'
  },
  app: {
    version: '2.1.0'
  },
  ui: {
    max_ad_length: 120,
    placement: 'inline',
    dark_mode: false,
    supports_images: true,
    supports_cta_button: true
  }
});
```

---

### General

**For:** Any integration not covered above. Start here if unsure.

#### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `device.ip` | `string` | IP address for geo-targeting. **Required when `device` included.** |
| `device.timezone` | `string` | IANA timezone. Enables time-based targeting. |
| `device.locale` | `string` | Locale. Enables localized ads. |
| `user.email` | `string` | User's email for identity matching. **Higher CPMs.** |
| `ui.max_ad_length` | `number` | Max characters for ad text. |
| `ui.placement` | `string` | `"inline"`, `"sidebar"`, `"banner"`, `"start_of_response"`, `"end_of_response"` |

#### Example

```typescript
const response = await client.getAd({
  messages: [
    { role: 'user', content: 'Where can I buy marathon gear?' }
  ],
  sessionId: 'session-general-001',
  userId: 'user-general-123',
  testAd: true,
  device: {
    ip: '192.168.1.1',
    timezone: 'America/New_York',
    locale: 'en-US'
  },
  ui: {
    max_ad_length: 200,
    placement: 'end_of_response'
  }
});
```

---

## Response Types

### AdResponse

```typescript
interface AdResponse {
  ads: Ad[];             // Array of ads
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
  impUrl?: string;       // Impression tracking URL (null for testAd)
  clickUrl?: string;     // Click-through URL (null for testAd)
  payout?: number;       // Payout amount (null for testAd)
}
```

### Common Types

```typescript
interface MessageObject {
  role: 'user' | 'assistant';
  content: string;
}
```

---

## Error Handling

The client returns `null` on failure. Errors are logged to console.

```typescript
const response = await client.getAd({
  messages,
  sessionId: 'session-123',
});

// Returns null on:
// - Network errors
// - 401: Invalid API key
// - 422: Validation error (e.g., missing sessionId)
// - 204: No relevant ad found
// - 429: Rate limit exceeded

if (!response) {
  // Handle gracefully - don't break the user experience
}
```

| Status | Meaning |
|--------|---------|
| `200` | Ad(s) matched and returned successfully |
| `204` | No matching ads found (null response) |
| `401` | Invalid or missing API key |
| `422` | Validation error (e.g., missing `sessionId`) |
| `429` | Rate limit exceeded |

---

## Using with React

For React applications, use the companion package `@gravity-ai/react`:

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
      testAd: true,
    }).then(res => setAd(res?.ads[0] || null));
  }, [messages]);

  return <AdBanner ad={ad} theme="dark" />;
}
```

---

## Best Practices

1. **`sessionId` is required** — Enables frequency capping and improves ad relevance.

2. **Include `userId` when available** — Improves targeting and increases CPMs.

3. **Use `testAd: true` during development** — Prevents generating real impressions or clicks.

4. **Handle null responses gracefully** — Don't break the UX when no ad is available.

5. **Fire `impUrl` when the ad is visible** — Required for proper impression tracking.

6. **Include `device.ip` for geo-targeting** — Enables location-based ads and higher CPMs.

7. **Include `user.email` when available** — Enables identity matching for significantly higher CPMs.

---

## TypeScript

Full TypeScript support with exported types:

```typescript
import { Client } from '@gravity-ai/api';
import type {
  AdParams,
  Ad,
  AdResponse,
  MessageObject,
  DeviceObject,
  UserObject,
} from '@gravity-ai/api';
```

---

## License

MIT
