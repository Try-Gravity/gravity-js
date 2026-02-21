import {
  Ad,
  GravityAdsOptions,
  GravityAdsResult,
  IncomingAdRequest,
  MessageObject,
  PlacementObject,
} from './types';

const DEFAULT_GRAVITY_API = 'https://server.trygravity.ai/api/v1/ad';
const DEFAULT_TIMEOUT_MS = 3000;

/**
 * Trim conversation to the last N turns sent to Gravity for contextual matching.
 */
function toGravityMessages(
  messages: MessageObject[],
  maxTurns = 2,
): MessageObject[] {
  if (!messages || messages.length === 0) return [];
  return messages.slice(-maxTurns).map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

/**
 * Extract the end-user's real IP from a server request object.
 * Works with Express, Fastify, Node http, Next.js, and any object with `headers`.
 */
function extractClientIp(req: IncomingAdRequest): string | undefined {
  if (!req) return undefined;

  const headers = req.headers || {};
  const forwarded = headers['x-forwarded-for'] || headers['x-real-ip'];
  if (forwarded) {
    const first = (typeof forwarded === 'string' ? forwarded : forwarded[0])
      ?.split(',')[0]
      ?.trim();
    if (first) return first;
  }

  if (req.socket?.remoteAddress) return req.socket.remoteAddress;
  if (req.connection?.remoteAddress) return req.connection.remoteAddress;
  if (req.ip) return req.ip;
  return undefined;
}

/**
 * Fetch ads from the Gravity API. **Never throws.**
 *
 * Reads `gravity_context` from `req.body` (sent by the client via `gravityContext()`),
 * extracts the end-user's IP from request headers, and calls the Gravity ad endpoint.
 *
 * The publisher just passes `req` through — no manual IP extraction or context
 * forwarding needed.
 *
 * @param req        - The server request object (Express, Fastify, Node http, Next.js, etc.)
 * @param messages   - Conversation messages `[{ role, content }]` — last 2 turns are sent
 * @param placements - Ad placements, e.g. `[{ placement: "below_response", placement_id: "main" }]`
 * @param opts       - API key, timeout, relevancy, testAd, etc.
 * @returns `{ ads, status, elapsed, requestBody, error? }` — always resolves
 *
 * @example Express
 * ```ts
 * import { gravityAds } from '@gravity-ai/api';
 *
 * app.post('/api/chat', async (req, res) => {
 *   const { messages } = req.body;
 *
 *   const adPromise = gravityAds(req, messages, [
 *     { placement: 'below_response', placement_id: 'main' },
 *   ]);
 *
 *   // stream your LLM response...
 *
 *   const { ads } = await adPromise;
 *   res.write(`data: ${JSON.stringify({ type: 'done', ads })}\n\n`);
 *   res.end();
 * });
 * ```
 *
 * @example Next.js Route Handler
 * ```ts
 * import { gravityAds } from '@gravity-ai/api';
 *
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const { ads } = await gravityAds(
 *     { body, headers: Object.fromEntries(request.headers) },
 *     body.messages,
 *     [{ placement: 'below_response', placement_id: 'main' }],
 *   );
 *   return Response.json({ ads });
 * }
 * ```
 */
export async function gravityAds(
  req: IncomingAdRequest,
  messages: MessageObject[],
  placements: PlacementObject[],
  opts: GravityAdsOptions = {},
): Promise<GravityAdsResult> {
  const apiKey =
    opts.apiKey ||
    (typeof process !== 'undefined' ? process.env?.GRAVITY_API_KEY : undefined);
  const gravityApi = opts.gravityApi || DEFAULT_GRAVITY_API;
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;

  if (!apiKey) {
    return { ads: [], status: 0, elapsed: '0', requestBody: null };
  }

  const ctx = req?.body?.gravity_context;
  const clientUser = ((ctx?.user) || {}) as Record<string, unknown>;
  const clientDevice = ((ctx?.device) || {}) as Record<string, unknown>;
  const clientIp = extractClientIp(req);

  const body: Record<string, unknown> = {
    messages: toGravityMessages(messages),
    sessionId: ctx?.sessionId,
    placements,
    user: {
      ...clientUser,
      id: clientUser.id || clientUser.userId || 'anonymous',
    },
    device: {
      ...clientDevice,
      ...(clientIp ? { ip: clientIp } : {}),
    },
  };

  body.relevancy = opts.relevancy ?? 0.2;
  body.testAd = opts.production === true ? false : true;
  if (opts.excludedTopics) body.excludedTopics = opts.excludedTopics;

  const start = performance.now();
  try {
    const res = await fetch(gravityApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    const elapsed = (performance.now() - start).toFixed(0);

    if (res.status === 204) {
      return { ads: [], status: 204, elapsed, requestBody: body };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        ads: [],
        status: res.status,
        elapsed,
        error: errText,
        requestBody: body,
      };
    }

    const data: unknown = await res.json();
    const ads: Ad[] = Array.isArray(data) ? data : [data as Ad];
    return { ads, status: 200, elapsed, requestBody: body };
  } catch (err: unknown) {
    const elapsed = (performance.now() - start).toFixed(0);
    const error =
      err instanceof Error
        ? err.name === 'TimeoutError'
          ? `Timeout (${timeoutMs}ms)`
          : err.message
        : String(err);
    return { ads: [], status: 0, elapsed, error, requestBody: body };
  }
}

export { toGravityMessages, extractClientIp };
