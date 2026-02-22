import { gravityAds } from './ads';
import {
  GravityAdsOptions,
  GravityAdsResult,
  IncomingAdRequest,
  MessageObject,
  PlacementObject,
} from './types';

/**
 * Gravity ad client.
 *
 * Configure once at startup, then call `getAds()` in your endpoint handlers.
 * Test ads are returned by default — pass `production: true` when you're ready
 * to go live.
 *
 * @example
 * ```ts
 * import { Gravity } from '@gravity-ai/api';
 *
 * const gravity = new Gravity({ production: true });
 *
 * app.post('/api/chat', async (req, res) => {
 *   const { messages } = req.body;
 *   const adPromise = gravity.getAds(req, messages, [
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
 */
export class Gravity {
  private opts: GravityAdsOptions;

  /**
   * @param opts - Configuration applied to every `getAds()` call.
   *
   * | Option | Type | Default | Description |
   * |--------|------|---------|-------------|
   * | `apiKey` | `string` | `process.env.GRAVITY_API_KEY` | Gravity API key |
   * | `production` | `boolean` | `false` | `true` = real ads. `false` = test ads (no billing). |
   * | `relevancy` | `number` | `0.2` | Minimum relevancy threshold (0-1) |
   * | `timeoutMs` | `number` | `3000` | Request timeout in ms |
   * | `excludedTopics` | `string[]` | — | Topics to exclude from ad matching |
   * | `gravityApi` | `string` | production URL | Custom API endpoint |
   */
  constructor(opts: GravityAdsOptions = {}) {
    this.opts = opts;
  }

  /**
   * Fetch ads from the Gravity API. **Never throws.**
   *
   * Reads `gravity_context` from `req.body` (sent by the client via
   * `gravityContext()`), extracts the end-user's IP from request headers,
   * and calls the Gravity ad endpoint.
   *
   * @param req        - Server request object (Express, Fastify, Next.js, etc.)
   * @param messages   - Conversation `[{ role, content }]` — last 2 turns sent
   * @param placements - Ad slots, e.g. `[{ placement: "below_response", placement_id: "main" }]`
   * @param overrides  - Per-call overrides that merge on top of constructor config
   * @returns `{ ads, status, elapsed, requestBody, error? }` — always resolves
   */
  async getAds(
    req: IncomingAdRequest,
    messages: MessageObject[],
    placements: PlacementObject[],
    overrides: GravityAdsOptions = {},
  ): Promise<GravityAdsResult> {
    return gravityAds(req, messages, placements, {
      ...this.opts,
      ...overrides,
    });
  }
}
