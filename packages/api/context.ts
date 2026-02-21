import { GravityContext, GravityContextOverrides } from './types';

/**
 * Collect device + user context and return a plain object to include
 * in your request body as `gravity_context`.
 *
 * Works in browsers, Node.js, Bun, and Deno. Auto-detects the runtime
 * and collects the appropriate signals (user-agent, screen size, timezone, etc.).
 *
 * Nothing is written to disk, localStorage, or cookies.
 *
 * @param overrides - Must include `sessionId` and `user.userId`.
 *
 * @example Browser (React, Next.js, vanilla JS)
 * ```ts
 * import { gravityContext } from '@gravity-ai/api';
 *
 * const ctx = gravityContext({
 *   sessionId: chatSession.id,
 *   user: { userId: currentUser.id },
 * });
 *
 * fetch('/api/chat', {
 *   method: 'POST',
 *   body: JSON.stringify({ messages, gravity_context: ctx }),
 * });
 * ```
 *
 * @example Node.js CLI
 * ```ts
 * const ctx = gravityContext({
 *   sessionId: conversationId,
 *   user: { userId: 'cli-user-1' },
 * });
 * ```
 */
export function gravityContext(overrides: GravityContextOverrides): GravityContext {
  if (!overrides?.sessionId) {
    throw new Error('gravityContext() requires sessionId');
  }
  if (!overrides?.user?.userId) {
    throw new Error('gravityContext() requires user.userId');
  }

  const isBrowser =
    typeof window !== 'undefined' && typeof navigator !== 'undefined';

  const device: Record<string, unknown> = isBrowser
    ? browserDevice()
    : nodeDevice();

  if (overrides.device) {
    Object.assign(device, overrides.device);
  }

  const { userId, ...restUser } = overrides.user;

  return {
    sessionId: overrides.sessionId,
    user: { id: userId, ...restUser },
    device,
  };
}

function browserDevice(): Record<string, unknown> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const win = typeof window !== 'undefined' ? window : undefined;

  return {
    ua: nav?.userAgent || '',
    browser: 'web',
    device_type: /Mobi|Android/i.test(nav?.userAgent || '')
      ? 'mobile'
      : 'desktop',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    language: nav?.language || 'en',
    screen_width: win?.screen?.width,
    screen_height: win?.screen?.height,
    viewport_width: win?.innerWidth,
    viewport_height: win?.innerHeight,
    platform: nav?.platform || 'web',
  };
}

function nodeDevice(): Record<string, unknown> {
  /* eslint-disable @typescript-eslint/no-require-imports */
  let os: typeof import('os') | undefined;
  try {
    os = require('os');
  } catch {
    // Not available (e.g. edge runtime) — fall back to minimal info
  }

  const runtimeTag = (() => {
    if (typeof globalThis !== 'undefined') {
      const g = globalThis as Record<string, unknown>;
      if (g.Bun && typeof g.Bun === 'object' && 'version' in (g.Bun as Record<string, unknown>)) {
        return `Bun/${(g.Bun as Record<string, unknown>).version}`;
      }
      if (g.Deno && typeof g.Deno === 'object') {
        const deno = g.Deno as Record<string, unknown>;
        const ver = deno.version as Record<string, string> | undefined;
        return `Deno/${ver?.deno || 'unknown'}`;
      }
    }
    if (typeof process !== 'undefined' && process.versions?.node) {
      return `Node/${process.versions.node}`;
    }
    return 'unknown';
  })();

  const cols =
    typeof process !== 'undefined'
      ? (process.stdout as { columns?: number })?.columns || 80
      : 80;
  const rows =
    typeof process !== 'undefined'
      ? (process.stdout as { rows?: number })?.rows || 24
      : 24;

  const env = typeof process !== 'undefined' ? process.env : ({} as Record<string, string | undefined>);

  return {
    ua: `gravity-js/${PKG_VERSION} (${os?.type() || 'unknown'} ${os?.arch() || 'unknown'}; ${runtimeTag})`,
    os: os ? `${os.type()} ${os.release()}` : undefined,
    browser: 'cli',
    device_type: env.CI ? 'server' : 'desktop',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    language: env.LANG?.split('.')[0]?.replace('_', '-') || 'en',
    platform: typeof process !== 'undefined' ? process.platform : undefined,
    arch: os?.arch(),
    screen_width: cols,
    screen_height: rows,
    viewport_width: cols,
    viewport_height: rows,
    runtime: runtimeTag,
    term_program: env.TERM_PROGRAM || undefined,
    term: env.TERM || undefined,
    colorterm: env.COLORTERM || undefined,
    is_ci: !!env.CI,
  };
}

const PKG_VERSION: string = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./package.json').version;
  } catch {
    return '0.0.0';
  }
})();
