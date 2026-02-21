# Gravity JavaScript SDKs

Official JavaScript/TypeScript SDKs for integrating Gravity AI contextual advertising into your applications.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@gravity-ai/api](packages/api) | Ad client + context collection + server-side ad fetching | ![npm](https://img.shields.io/npm/v/@gravity-ai/api) |
| [@gravity-ai/react](packages/react) | React components for rendering ads | ![npm](https://img.shields.io/npm/v/@gravity-ai/react) |

## Quick Start

### 1. Install

```bash
npm install @gravity-ai/api
```

### 2. Client — collect context in your chat component

```ts
import { gravityContext } from '@gravity-ai/api';

const gravity_context = gravityContext({
  sessionId: chatSession.id,
  user: { userId: currentUser.id },
});

fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages, gravity_context }),
});
```

### 3. Server — fetch ads alongside your LLM call

Set `GRAVITY_API_KEY` in your server environment.

```ts
import { Gravity } from '@gravity-ai/api';

const gravity = new Gravity({ production: true });

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  // Fire ad request in parallel with your LLM call
  const adPromise = gravity.getAds(req, messages, [
    { placement: 'below_response', placement_id: 'main' },
  ]);

  // Stream your LLM response...
  for await (const token of streamYourLLM(messages)) {
    res.write(`data: ${JSON.stringify({ type: 'chunk', content: token })}\n\n`);
  }

  // Append ads at the end
  const { ads } = await adPromise;
  res.write(`data: ${JSON.stringify({ type: 'done', ads })}\n\n`);
  res.end();
});
```

### 4. Render (optional — React)

```bash
npm install @gravity-ai/react
```

```tsx
import { GravityAd } from '@gravity-ai/react';

<GravityAd ad={ads[0]} variant="card" />
```

That's it. `gravityContext()` collects device signals on the client. `gravity.getAds()` reads them from `req.body`, adds the user's IP, and calls the Gravity API. Never throws.

By default, `new Gravity()` returns **test ads** (no billing). Pass `production: true` when you're ready to go live.

---

## How It Works

```
┌──────────────────┐    gravity_context in body    ┌──────────────────┐    POST /api/v1/ad    ┌─────────┐
│   Client code    │ ────────────────────────────▶ │   Your server    │ ──────────────────▶   │ Gravity │
│                  │                               │                  │                       │   API   │
│ gravityContext() │   { sessionId,                │ gravity.getAds(  │   { messages,         │ returns │
│   auto-detects   │     user: {...},              │   req, messages, │     sessionId,        │  Ad[]   │
│   user + device  │     device: {...} }           │   placements)    │     user: {...},      │         │
│                  │                               │  reads ctx from  │     device: {ip,...} } │         │
└──────────────────┘                               │  req.body + IP   │                       └─────────┘
                                                   └──────────────────┘
```

## Python

For Python backends, use [`gravity-py`](https://github.com/Try-Gravity/gravity-py):

```bash
pip install gravity-sdk
```

Same pattern — `Gravity(production=True)` + `gravity.get_ads(request, messages, placements)`. The client-side `gravityContext()` from `@gravity-ai/api` works identically with both server SDKs.

## Documentation

- **[@gravity-ai/api README](packages/api/README.md)** — Full integration guide, API reference, Next.js / Express / Fastify examples
- **[@gravity-ai/react README](packages/react/README.md)** — React components, variants, styling, impression tracking

## Development

This is a monorepo using npm workspaces.

```bash
git clone https://github.com/Try-Gravity/gravity-js.git
cd gravity-js
npm install
npm run build
npm run test
```

### Project Structure

```
gravity-js/
├── packages/
│   ├── api/                 # @gravity-ai/api
│   │   ├── gravity.ts       # Gravity class (primary API)
│   │   ├── context.ts       # gravityContext() — client-side context collection
│   │   ├── ads.ts           # gravityAds() — low-level ad fetching function
│   │   ├── client.ts        # Client class (legacy low-level API client)
│   │   ├── types.ts         # TypeScript types
│   │   └── index.ts         # Package exports
│   └── react/               # @gravity-ai/react
│       └── src/
│           ├── components/  # GravityAd, AdText
│           ├── hooks/       # useAdTracking
│           └── types.ts     # Component types
├── examples/
│   ├── api-test/            # Node.js API test
│   └── react-test/          # React component playground
└── package.json             # Root workspace config
```

## FAQ

### What parameters are required?

`sessionId` and `user.userId` are required for `gravityContext()`. `placements` (with `placement_id`) are required for `gravity.getAds()`.

### Where does the API key go?

Set `GRAVITY_API_KEY` as an environment variable on your server. The `Gravity` class reads it automatically. You can also pass it explicitly via `new Gravity({ apiKey: '...' })`.

### Does the ad request block my LLM response?

No. Fire `gravity.getAds()` in parallel with your LLM call using `Promise.allSettled()`. It never throws, so failures are silent.

### Do I need to handle impression tracking?

If using `@gravity-ai/react`, no — the `GravityAd` component fires impression pixels automatically via IntersectionObserver. For custom rendering, fire `new Image().src = ad.impUrl` when the ad becomes visible.

## License

MIT
