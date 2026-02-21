# @gravity-ai/api

JavaScript/TypeScript SDK for [Gravity](https://trygravity.ai) ads.

```ts
import { Gravity } from '@gravity-ai/api';

const gravity = new Gravity({ production: true }); // reads GRAVITY_API_KEY from env

const result = await gravity.getAds(req, messages, placements);
```

Works with Express, Fastify, Next.js, Node http, Bun, and Deno.

## Install

```bash
npm install @gravity-ai/api
```

Set `GRAVITY_API_KEY` in your server environment.

---

## Integration

### Client — your chat component

```diff
+ import { gravityContext } from '@gravity-ai/api';

  async function sendMessage(prompt) {
+   const gravity_context = gravityContext({
+     sessionId: chatSession.id,
+     user: { userId: currentUser.id },
+   });

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
-     body: JSON.stringify({ messages }),
+     body: JSON.stringify({ messages, gravity_context }),
    });
  }
```

> **`sessionId` and `userId` are required.** Pass your chat/conversation session ID and your authenticated user's ID.

`gravityContext()` auto-detects the runtime (browser vs Node/Bun/Deno) and collects the appropriate signals — user-agent, screen size, timezone, locale, etc. Nothing is written to disk, localStorage, or cookies.

### Server — Node.js (Express / Fastify / any framework)

```diff
+ import { Gravity } from '@gravity-ai/api';

+ const gravity = new Gravity({ production: true });

  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

+   const adPromise = gravity.getAds(req, messages, [
+     { placement: 'below_response', placement_id: 'main' },
+   ]);

    // stream your LLM response as usual...
    res.setHeader('Content-Type', 'text/event-stream');
    for await (const token of streamYourLLM(messages)) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: token })}\n\n`);
    }

+   const { ads } = await adPromise;
+   res.write(`data: ${JSON.stringify({ type: 'done', ads })}\n\n`);
    res.end();
  });
```

`gravity.getAds()` reads `gravity_context` from `req.body`, extracts the end-user's IP from headers, and calls the Gravity API. It **never throws** — returns `{ ads: [] }` on any failure so your chat flow is never blocked.

### Next.js Route Handler

```ts
import { Gravity } from '@gravity-ai/api';

const gravity = new Gravity({ production: true });

export async function POST(request: Request) {
  const body = await request.json();
  const { ads } = await gravity.getAds(
    { body, headers: Object.fromEntries(request.headers) },
    body.messages,
    [{ placement: 'below_response', placement_id: 'main' }],
  );
  return Response.json({ ads });
}
```

### Parallel with your LLM call

```ts
const [adResult, llmResult] = await Promise.allSettled([
  gravity.getAds(req, messages, placements),
  yourLLMCall(messages),
]);
```

Ad latency never blocks the chat response.

---

## Server — Python

For Python backends (FastAPI, Django, Flask), use the [`gravity-py`](https://github.com/Try-Gravity/gravity-py) package:

```bash
pip install gravity-sdk
```

```diff
+ from gravity_sdk import Gravity

+ gravity = Gravity(production=True)

  @app.post("/api/chat")
  async def chat(request: Request):
      body = await request.json()
      messages = body["messages"]

+     ad_task = asyncio.create_task(
+         gravity.get_ads(request, messages, [{"placement": "chat", "placement_id": "main"}])
+     )

      async def event_stream():
          async for token in stream_your_llm(messages):
              yield f"data: {json.dumps({'type': 'chunk', 'content': token})}\n\n"

+         ad_result = await ad_task
+         ads = [a.to_dict() for a in ad_result.ads]
+         yield f"data: {json.dumps({'type': 'done', 'ads': ads})}\n\n"

      return StreamingResponse(event_stream(), media_type="text/event-stream")
```

---

## API Reference

### `new Gravity(opts?)`

Configure once at startup. All options are optional.

```ts
const gravity = new Gravity({
  production: true,
  relevancy: 0.3,
  excludedTopics: ['gambling'],
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `process.env.GRAVITY_API_KEY` | Gravity API key |
| `production` | `boolean` | `false` | `true` = real ads. `false` = test ads (no billing). |
| `relevancy` | `number` | `0.2` | Minimum relevancy threshold (0-1). Lower = more ads. |
| `timeoutMs` | `number` | `3000` | Request timeout in ms |
| `excludedTopics` | `string[]` | — | Topics to exclude from ad matching |
| `gravityApi` | `string` | production URL | Custom API endpoint |

### `gravity.getAds(req, messages, placements, overrides?)`

Fetch ads. **Never throws.** Returns `{ ads: [] }` on any failure.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `req` | `object` | Yes | Server request object. `gravity_context` is read from `req.body`. |
| `messages` | `MessageObject[]` | Yes | Conversation `[{ role, content }]` — last 2 turns sent |
| `placements` | `PlacementObject[]` | Yes | Ad slots, e.g. `[{ placement: "below_response", placement_id: "main" }]` |
| `overrides` | `GravityAdsOptions` | No | Per-call overrides merged on top of constructor config |

**Returns:** `{ ads: Ad[], status: number, elapsed: string, requestBody: object, error?: string }`

### `gravityContext(overrides)`

Client-side. Collects device + user context. Returns a plain object to include in your request body.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `overrides.sessionId` | `string` | Yes | Your chat/conversation session ID |
| `overrides.user.userId` | `string` | Yes | Your authenticated user's ID |
| `overrides.device` | `object` | No | Device field overrides |

**Returns:** `{ sessionId, user: { id, ... }, device: { ua, timezone, locale, ... } }`

Auto-detected fields vary by runtime:

| Field | Browser | Node/Bun/Deno |
|-------|---------|---------------|
| `ua` | `navigator.userAgent` | `gravity-js/x.x.x (OS arch; Runtime/ver)` |
| `browser` | `"web"` | `"cli"` |
| `device_type` | `"mobile"` or `"desktop"` | `"server"` (CI) or `"desktop"` |
| `timezone` | `Intl.DateTimeFormat` | `Intl.DateTimeFormat` |
| `screen_width/height` | `screen.width/height` | `stdout.columns/rows` |
| `viewport_width/height` | `innerWidth/Height` | `stdout.columns/rows` |

### `gravityAds(req, messages, placements, opts?)` (low-level)

Standalone function — same as `gravity.getAds()` but takes all config per-call. Useful when you don't want to instantiate a class.

```ts
import { gravityAds } from '@gravity-ai/api';

const { ads } = await gravityAds(req, messages, placements, { production: true });
```

---

## Data Flow

```
┌──────────────────┐    gravity_context in body    ┌──────────────────┐    POST /api/v1/ad    ┌─────────┐
│   Client code    │ ────────────────────────────▶ │   Your server    │ ──────────────────▶   │ Gravity │
│                  │                               │                  │                       │   API   │
│ gravityContext() │   { sessionId,                │ gravity.getAds(  │   { messages,         │         │
│   auto-detects   │     user: {...},              │   req, messages, │     sessionId,        │ returns │
│   user + device  │     device: {...} }           │   placements)    │     user: {...},      │  Ad[]   │
│                  │                               │  reads ctx from  │     device: {ip,...} } │         │
└──────────────────┘                               │  req.body + IP   │                       └─────────┘
                                                   └──────────────────┘
```

---

## Rendering Ads

### React

```bash
npm install @gravity-ai/react
```

```tsx
import { GravityAd } from '@gravity-ai/react';

<GravityAd ad={ads[0]} variant="card" />
```

See [@gravity-ai/react](../react/README.md) for component docs, variants, and styling.

### Vanilla JS / any framework

Ads are plain JSON objects. Render them however you want:

```ts
const ad = ads[0];
if (ad) {
  element.innerHTML = `<a href="${ad.clickUrl}">${ad.adText}</a>`;
  if (ad.impUrl) new Image().src = ad.impUrl;
}
```

---

## License

MIT
