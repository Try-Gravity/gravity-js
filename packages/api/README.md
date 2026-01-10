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
  sessionId: 'session-123',
  userId: 'user-456',
  numAds: 1,
  render_context: {
    placements: [{ placement: 'below_response' }]
  },
  testAd: true,
});

if (response) {
  const ad = response.ads[0];
  console.log(ad.adText);
}
```

---

## Migrating from v0

If you're upgrading from a previous version, there are key changes:

**1. `sessionId` is now required**

**2. `render_context` object with `placements` array is now required**

**3. Response format changed to `ads` array**

```typescript
// Before (v0)
const ad = await client.getAd({ messages });

// After (v1)
const response = await client.getAd({
  messages,
  sessionId: 'session-123',
  numAds: 1,
  render_context: {
    placements: [{ placement: 'below_response' }]
  }
});
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

Choose the integration type that matches your application. All types share a **common schema**.

### Common Fields

| Field | Type | Description |
|-------|------|-------------|
| `messages` | `MessageObject[]` | Conversation context. Array of `{role, content}` objects. **Required.** |
| `sessionId` | `string` | Session identifier for frequency capping. **Required.** |
| `render_context` | `RenderContextObject` | Describes how the ad will be rendered in your app. **Required.** |
| `userId` | `string` | Unique user identifier. |
| `testAd` | `boolean` | Returns real ad without tracking. Use for testing. |
| `numAds` | `number` | Number of ads to return (1-3). Must match `placements` length. |

#### What is `render_context`?

The `render_context` object describes how the ad will be rendered in your app, so Gravity can generate a more contextually relevant ad.

For example:
- **`placements`** — Where you plan to show the ad (below the response, in a sidebar, etc.)
- **`max_ad_length`** — Character limit you can display, so we don't send copy that gets truncated
- **`supports_markdown`** — Whether you can render formatted text
- **`supports_images`** — Whether you can display brand logos or product images

The more context you provide, the better we can optimize the ad copy, format, and creative for your specific integration.

<details>
<summary><strong>RenderContextObject</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| `placements` | `PlacementObject[]` | Array of placement objects (1-3). Length must match `numAds`. **Required.** |
| `max_ad_length` | `number` | Max characters for ad text. |
| `supports_markdown` | `boolean` | Whether markdown rendering is supported. |
| `supports_links` | `boolean` | Whether clickable links are supported. |
| `supports_images` | `boolean` | Whether images can be displayed. |
| `supports_cta_button` | `boolean` | Whether CTA buttons are supported. |

</details>

<details>
<summary><strong>PlacementObject</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| `placement` | `string` | **Required.** One of: `"above_response"`, `"below_response"`, `"inline_response"`, `"left_response"`, `"right_response"` |
| `placement_id` | `string` | Optional tracking ID for this ad slot. |

</details>

<details>
<summary><strong>DeviceObject</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| `ip` | `string` | IP address for geo-targeting. **Required.** |
| `ua` | `string` | User agent string. Enables browser/device detection. |
| `os` | `string` | Operating system: `"macos"`, `"windows"`, `"linux"`, `"iOS"`, `"Android"`. |
| `os_version` | `string` | OS version (e.g., `"17.2"`). |
| `browser` | `string` | Browser name: `"chrome"`, `"safari"`, `"firefox"`. |
| `device_type` | `string` | `"desktop"`, `"mobile"`, `"tablet"`. |
| `device_model` | `string` | Device model (e.g., `"iPhone 15 Pro"`). |
| `ifa` | `string` | IDFA/GAID for cross-app attribution. **Higher CPMs.** |
| `timezone` | `string` | IANA timezone (e.g., `"America/New_York"`). |
| `locale` | `string` | Locale (e.g., `"en-US"`). |
| `connection_type` | `string` | `"wifi"` or `"cellular"`. |

</details>

<details>
<summary><strong>UserObject</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| `email` | `string` | User's email for identity matching. **Higher CPMs.** |
| `gender` | `string` | `"male"`, `"female"`, `"other"`. |
| `age` | `string` | Age range: `"18-24"`, `"25-34"`, `"35-44"`, etc. |
| `keywords` | `string` | Comma-separated interest keywords. |
| `subscription_tier` | `string` | `"free"`, `"pro"`, `"premium"`, `"enterprise"`. |
| `user_created_at` | `string` | Account creation date (ISO 8601). |
| `user_interests` | `string[]` | Array of user interests for targeting. |

</details>

---

### Web

**For:** Chat interfaces, AI assistants, web apps with conversational UI

#### Web-specific Fields

| Field | Type | Description |
|-------|------|-------------|
| `web.referrer` | `string` | Referring URL. Enables traffic source targeting. |

#### Example

```typescript
const response = await client.getAd({
  // Common fields
  messages: [
    { role: 'user', content: 'What are the best practices for React performance?' }
  ],
  sessionId: 'session-web-001',
  userId: 'user-web-789',
  numAds: 1,
  testAd: true,
  render_context: {
    placements: [
      { placement: 'right_response', placement_id: 'sidebar-1' }
    ],
    max_ad_length: 200
  },

  // Web-specific fields
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
  }
});
```

---

### IDE / CLI

**For:** Dev tools like Cursor, Claude Code, GitHub Copilot, Windsurf and VS Code extensions

#### IDE-specific Fields

<details>
<summary><strong>IDEObject</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | IDE name: `"cursor"`, `"vscode"`, `"intellij"`. |
| `session_duration_ms` | `number` | Time since IDE opened. Helps with engagement-based targeting. |
| `active_file_language` | `string` | Current file language (e.g., `"typescript"`). |

</details>

#### Example

```typescript
const response = await client.getAd({
  // Common fields
  messages: [
    { role: 'user', content: 'How do I set up authentication in my Express app?' }
  ],
  sessionId: 'session-ide-001',
  userId: 'user-dev-123',
  numAds: 1,
  testAd: true,
  render_context: {
    placements: [
      { placement: 'below_response' }
    ],
    max_ad_length: 280,
    supports_markdown: true,
    supports_links: true
  },

  // IDE-specific fields
  user: {
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
    session_duration_ms: 3600000,
    active_file_language: 'typescript'
  }
});
```

---

### Mobile

**For:** iOS apps, Android apps, React Native, Flutter

#### Mobile-specific Fields

<details>
<summary><strong>AppObject</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| `version` | `string` | Your app version. |

</details>

#### Example

```typescript
const response = await client.getAd({
  // Common fields
  messages: [
    { role: 'assistant', content: 'I found several Italian restaurants nearby.' },
    { role: 'user', content: 'Which one has the best pasta?' }
  ],
  sessionId: 'session-mobile-001',
  userId: 'user-app-456',
  numAds: 1,
  testAd: true,
  render_context: {
    placements: [
      { placement: 'inline_response' }
    ],
    max_ad_length: 150,
    supports_images: true,
    supports_cta_button: true
  },

  // Mobile-specific fields
  user: {
    email: 'user@example.com',
    subscription_tier: 'premium',
    user_created_at: '2023-06-15T00:00:00Z',
    user_interests: ['food', 'dining', 'travel']
  },
  device: {
    ip: '198.51.100.23',
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
  }
});
```

---

### General

**For:** Any integration not covered above.

#### Example

```typescript
const response = await client.getAd({
  // Common fields
  messages: [
    { role: 'user', content: 'Where can I buy marathon gear?' }
  ],
  sessionId: 'session-general-001',
  userId: 'user-general-123',
  numAds: 1,
  testAd: true,
  render_context: {
    placements: [
      { placement: 'below_response' }
    ]
  },

  // Optional fields
  device: {
    ip: '192.168.1.1',
    timezone: 'America/New_York',
    locale: 'en-US'
  }
});
```

---

## Response Types

### AdResponse

```typescript
interface AdResponse {
  ads: Ad[];             // Array of ads (one per placement)
  numAds: number;        // Number of ads returned
  totalPayout?: number;  // Total payout across all ads
}
```

### Ad

```typescript
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

### Request Types

```typescript
interface MessageObject {
  role: 'user' | 'assistant';
  content: string;
}

interface RenderContextObject {
  placements: PlacementObject[];  // Required, 1-3 items
  max_ad_length?: number;
  supports_markdown?: boolean;
  supports_links?: boolean;
  supports_images?: boolean;
  supports_cta_button?: boolean;
}

interface PlacementObject {
  placement: 'above_response' | 'below_response' | 'inline_response' | 'left_response' | 'right_response';
  placement_id?: string;
}
```

---

## Error Handling

The client returns `null` on failure. Errors are logged to console.

```typescript
const response = await client.getAd({
  messages,
  sessionId: 'session-123',
  numAds: 1,
  render_context: { placements: [{ placement: 'below_response' }] }
});

// Returns null on:
// - Network errors
// - 401: Invalid API key
// - 422: Validation error (missing sessionId, render_context, or numAds/placements mismatch)
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
| `422` | Validation error (e.g., missing `sessionId`, `render_context`, or `numAds`/`placements` mismatch) |
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
      numAds: 1,
      render_context: { placements: [{ placement: 'below_response' }] },
      testAd: true,
    }).then(res => setAd(res?.ads[0] || null));
  }, [messages]);

  return <AdBanner ad={ad} theme="dark" />;
}
```

---

## Best Practices

1. **`sessionId` and `render_context` are required** — Enable frequency capping and ad placement tracking.

2. **`numAds` must match `placements` length** — Request 2 ads? Provide 2 placement objects.

3. **Include `userId` when available** — Improves targeting and increases CPMs.

4. **Use `testAd: true` during development** — Prevents generating real impressions or clicks.

5. **Handle null responses gracefully** — Don't break the UX when no ad is available.

6. **Fire `impUrl` when the ad is visible** — Required for proper impression tracking.

7. **Include `device.ip` for geo-targeting** — Enables location-based ads and higher CPMs.

8. **Include `user.email` when available** — Enables identity matching for significantly higher CPMs.

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
  RenderContextObject,
  PlacementObject,
  DeviceObject,
  UserObject,
} from '@gravity-ai/api';
```

---

## License

MIT
