# Gravity JavaScript SDKs

Official JavaScript/TypeScript SDKs for integrating Gravity AI contextual advertising into your applications.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@gravity-ai/api](packages/api) | Core API client for fetching ads | ![npm](https://img.shields.io/npm/v/@gravity-ai/api) |
| [@gravity-ai/react](packages/react) | React components for rendering ads | ![npm](https://img.shields.io/npm/v/@gravity-ai/react) |

## Installation

### API Client Only

```bash
npm install @gravity-ai/api
```

### API Client + React Components

```bash
npm install @gravity-ai/api @gravity-ai/react
```

> **Note:** The React package requires `react >= 17.0.0` as a peer dependency.

## Quick Start

### Fetching Ads

```typescript
import { Client } from '@gravity-ai/api';

const client = new Client('your-api-key');

const ads = await client.getAd({
  messages: [
    { role: 'user', content: 'What are some good hiking trails?' },
    { role: 'assistant', content: 'Here are some popular hiking trails...' }
  ],
  sessionId: 'session-123',
  placements: [{ placement: 'below_response', placement_id: 'main-ad' }],
  testAd: true,
});

if (ads) {
  const ad = ads[0];
  console.log(ad.adText);    // The ad copy
  console.log(ad.clickUrl);  // Click-through URL
  console.log(ad.impUrl);    // Impression tracking URL
}
```

### With React Components

```tsx
import { Client } from '@gravity-ai/api';
import { AdBanner } from '@gravity-ai/react';
import { useState, useEffect } from 'react';

const client = new Client('your-api-key');

function ChatApp({ messages }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    client.getAd({
      messages,
      sessionId: 'session-123',
      placements: [{ placement: 'below_response', placement_id: 'main-ad' }],
      testAd: true,
    }).then(ads => setAd(ads?.[0] || null));
  }, [messages]);

  return (
    <div>
      {/* Your chat UI */}
      <AdBanner
        ad={ad}
        theme="dark"
        size="medium"
        onImpression={() => console.log('Ad viewed')}
      />
    </div>
  );
}
```

## Migrating from v0

If you're upgrading from a previous version, there are three key changes:

**1. `sessionId` is now required**

**2. `placements` array is now required** (with `placement_id` for each placement)

**3. Response is now a flat `Ad[]` array**
```typescript
// Before (v0)
const ad = await client.getAd({ messages });
if (ad) {
  console.log(ad.adText);
}

// After (v1)
const ads = await client.getAd({
  messages,
  sessionId: 'session-123',
  placements: [{ placement: 'below_response', placement_id: 'main-ad' }]
});
if (ads) {
  const ad = ads[0];
  console.log(ad.adText);
}
```

## API Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAd()` | `/api/v1/ad` | Contextual ads based on conversation messages |

## Documentation

- **[@gravity-ai/api README](packages/api/README.md)** - Full API client documentation
- **[@gravity-ai/react README](packages/react/README.md)** - React components documentation

## Development

This is a monorepo using npm workspaces.

### Setup

```bash
# Clone the repository
git clone https://github.com/Try-Gravity/gravity-js.git
cd gravity-js

# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test
```

### Local Development

```bash
# Watch mode for api package
cd packages/api && npm run dev

# Watch mode for react package  
cd packages/react && npm run dev
```

### Testing React Components Locally

We include a test app for visual testing of React components:

```bash
# Install example dependencies
cd examples/react-test
npm install

# Start the dev server
npm run dev
```

Then open http://localhost:5173 in your browser to see the component playground.

### Project Structure

```
gravity-js/
├── packages/
│   ├── api/                 # @gravity-ai/api
│   │   ├── client.ts        # Main API client
│   │   ├── types.ts         # TypeScript types
│   │   └── index.ts         # Package exports
│   └── react/               # @gravity-ai/react
│       └── src/
│           ├── components/  # React components
│           ├── hooks/       # Custom hooks
│           └── types.ts     # Component types
├── examples/
│   └── react-test/          # Visual testing app
└── package.json             # Root workspace config
```

## FAQ

### What parameters are required?

**`sessionId` and `placements` are required.** Each placement must include a `placement_id`. `userId` should always be included when available for better ad relevance and higher CPMs.

### How do I style the AdBanner to match my app?

Use the built-in themes, or override with custom props:

```tsx
<AdBanner
  ad={ad}
  backgroundColor="#1e1b4b"
  textColor="#e0e7ff"
  accentColor="#818cf8"
  borderRadius={16}
/>
```

Or use the `theme="minimal"` preset and apply your own CSS via `className`.

### Do I need to handle impression tracking manually?

No! The React components automatically fire impression pixels when rendered. You can disable this with `disableImpressionTracking={true}` if needed.

## License

MIT
