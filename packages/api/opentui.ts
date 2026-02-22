/**
 * @gravity-ai/api/opentui — Gravity ad rendering + tracking for OpenTUI terminals
 *
 * Two levels of abstraction:
 *
 * 1. `createGravityAdCard()` — batteries-included ad card. Creates the layout,
 *    populates content, handles height, wires tracking. One call to integrate.
 *
 *    ```ts
 *    import { createGravityAdCard } from '@gravity-ai/api/opentui';
 *
 *    const adCard = createGravityAdCard({ renderer, input });
 *    root.add(adCard.panel);
 *    adCard.showAd(ads[0]);
 *    ```
 *
 * 2. `gravityAdTracking()` — low-level tracking primitive. You build the layout,
 *    the SDK wires impression firing, click-to-open-browser, and hover/click.
 *
 *    ```ts
 *    import { gravityAdTracking } from '@gravity-ai/api/opentui';
 *
 *    const tracking = gravityAdTracking({ renderer, input, panel, clickTargets: [text] });
 *    tracking.setAd(ads[0]);
 *    ```
 *
 * Requires `@opentui/core` as a peer dependency.
 */

import { execFile } from 'child_process';
import type { Ad } from './types';

// ──────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────

function openUrl(url: string) {
  if (!url) return;
  try {
    let child;
    if (process.platform === 'darwin') {
      child = execFile('open', [url]);
    } else if (process.platform === 'win32') {
      child = execFile('rundll32', ['url.dll,FileProtocolHandler', url]);
    } else {
      child = execFile('xdg-open', [url]);
    }
    child.on('error', () => {});
  } catch {
    // Never break the host app for click handling failures
  }
}

function fireImpression(impUrl: string): void {
  try {
    fetch(impUrl).catch(() => {});
  } catch {
    // Never break the host app for tracking failures
  }
}

// ══════════════════════════════════════════════════════════════
// gravityAdTracking — low-level tracking primitive
// ══════════════════════════════════════════════════════════════

export interface GravityAdTrackingOptions {
  /** OpenTUI renderer instance. */
  renderer: any;
  /** OpenTUI `InputRenderable` — focus returns here when hover ends. */
  input: any;
  /**
   * The root renderable that represents the ad.
   * `visible` is toggled by `setAd()` / `clear()`.
   */
  panel: any;
  /**
   * All renderables that should respond to mouse hover/click.
   * Typically every child in the ad card so the entire surface is interactive.
   * The panel itself is included automatically — no need to list it here.
   */
  clickTargets?: any[];
  /** Called when an impression pixel fires. */
  onImpression?: (ad: Ad) => void;
  /** Called when the user clicks the ad (before the browser opens). */
  onClick?: (ad: Ad) => void;
  /** Custom hover-on handler. Called instead of the default cursor/pointer logic. */
  onHoverIn?: (ad: Ad) => void;
  /** Custom hover-off handler. Called instead of the default cursor/pointer logic. */
  onHoverOut?: () => void;
}

export interface GravityAdTracking {
  /**
   * Set the active ad. Fires the impression pixel, shows the panel,
   * and wires click/hover to the ad's URL.
   * Pass `null` to hide (same as `clear()`).
   */
  setAd: (ad: Ad | null) => void;
  /** Hide the ad and reset all state. */
  clear: () => void;
  /** The currently active ad, or `null`. */
  readonly ad: Ad | null;
  /** Whether the impression has been fired for the current ad. */
  readonly impressionFired: boolean;
}

/**
 * Wire Gravity ad tracking onto your own OpenTUI renderables.
 *
 * Handles impression firing (via `fetch()`), click-to-open-browser,
 * mouse hover cursor changes, and input focus management.
 * You build the layout however you want.
 *
 * @example
 * ```ts
 * import { gravityAdTracking } from '@gravity-ai/api/opentui';
 *
 * const myPanel = new BoxRenderable(renderer, { ... });
 * const myTitle = new TextRenderable(renderer, { ... });
 * const myCta = new TextRenderable(renderer, { ... });
 * myPanel.add(myTitle);
 * myPanel.add(myCta);
 *
 * const tracking = gravityAdTracking({
 *   renderer,
 *   input,
 *   panel: myPanel,
 *   clickTargets: [myTitle, myCta],
 * });
 *
 * // When you receive an ad:
 * tracking.setAd(ads[0]);
 *
 * // To hide:
 * tracking.clear();
 * ```
 */
export function gravityAdTracking(
  options: GravityAdTrackingOptions,
): GravityAdTracking {
  const {
    renderer,
    input,
    panel,
    clickTargets = [],
    onImpression,
    onClick,
    onHoverIn,
    onHoverOut,
  } = options;

  let activeAd: Ad | null = null;
  let activeUrl = '';
  let hovered = false;
  let _impressionFired = false;

  function setHover(next: boolean) {
    if (!activeUrl) return;
    if (hovered === next) return;
    hovered = next;

    if (next && activeAd) {
      if (onHoverIn) {
        onHoverIn(activeAd);
      } else {
        input.blur();
        renderer.setCursorStyle({ cursor: 'pointer', style: 'block', blinking: false });
        renderer.setMousePointer('pointer');
      }
    } else {
      if (onHoverOut) {
        onHoverOut();
      } else {
        renderer.setCursorStyle({ cursor: 'default', style: 'block', blinking: false });
        renderer.setMousePointer('default');
        input.focus();
      }
    }
    renderer.requestRender();
  }

  function handleClick() {
    if (!activeUrl || !activeAd) return;
    onClick?.(activeAd);
    openUrl(activeUrl);
    renderer.requestRender();
  }

  function wireMouse(target: any) {
    target.onMouseOver = () => setHover(true);
    target.onMouseOut = () => setHover(false);
    target.onMouseMove = () => setHover(true);
    target.onMouseDown = () => handleClick();
  }

  // Wire the panel itself + all explicit targets
  wireMouse(panel);
  for (const target of clickTargets) {
    wireMouse(target);
  }

  function clear() {
    if (hovered) {
      if (onHoverOut) {
        onHoverOut();
      } else {
        renderer.setCursorStyle({ cursor: 'default', style: 'block', blinking: false });
        renderer.setMousePointer('default');
        input.focus();
      }
    }
    activeAd = null;
    activeUrl = '';
    hovered = false;
    _impressionFired = false;
    panel.visible = false;
  }

  function setAd(ad: Ad | null) {
    if (!ad) {
      clear();
      return;
    }

    if (hovered) {
      if (onHoverOut) {
        onHoverOut();
      } else {
        renderer.setCursorStyle({ cursor: 'default', style: 'block', blinking: false });
        renderer.setMousePointer('default');
        input.focus();
      }
    }

    activeAd = ad;
    activeUrl = ad.clickUrl || ad.url || '';
    hovered = false;
    _impressionFired = false;
    panel.visible = true;

    if (ad.impUrl) {
      fireImpression(ad.impUrl);
      _impressionFired = true;
      onImpression?.(ad);
    }
  }

  return {
    setAd,
    clear,
    get ad() { return activeAd; },
    get impressionFired() { return _impressionFired; },
  };
}

// ══════════════════════════════════════════════════════════════
// createGravityAdCard — batteries-included ad card
// ══════════════════════════════════════════════════════════════

export interface GravityAdCardStyleProps {
  borderColor?: string;
  backgroundColor?: string;
}

export interface GravityAdCardOptions {
  /** OpenTUI renderer instance. */
  renderer: any;
  /** OpenTUI `InputRenderable` — focus returns here when hover ends. */
  input: any;
  /**
   * Layout variant.
   * - `'card'` (default): bordered card with title, body, CTA, and "Ad" label.
   * - `'minimal'`: no border or background — just text + tracking.
   */
  variant?: 'card' | 'minimal';
  /** Called when an impression pixel fires. */
  onImpression?: (ad: Ad) => void;
  /** Called when the user clicks the ad (before the browser opens). */
  onClick?: (ad: Ad) => void;

  /** Style overrides for the outer panel (border, background). */
  panel?: GravityAdCardStyleProps;
  /** Style overrides for the ad body text. */
  text?: { fg?: string };
  /** Style overrides for the CTA text. */
  cta?: { fg?: string };
  /** Style overrides for the "Ad" label. */
  label?: { fg?: string };
  /**
   * Hover state overrides. The default ships with a visible hover
   * affordance (brighter border + lighter background) because it
   * directly impacts click-through rate.
   */
  hoverPanel?: GravityAdCardStyleProps;
}

export interface GravityAdCard {
  /** The root renderable — add this to your render tree. */
  panel: any;
  /** Populate the card with an ad and activate tracking. Pass `null` to hide. */
  showAd: (ad: Ad | null) => void;
  /** Hide the card and reset all state. */
  clear: () => void;
  /** Direct access to inner renderables for post-creation mutation. */
  elements: {
    text: any;
    cta: any;
    label: any;
  };
  /** The underlying tracking instance. */
  tracking: GravityAdTracking;
}

// ── Defaults ────────────────────────────────────────────────

const CARD_DEFAULTS = {
  panel: {
    borderStyle: 'single' as const,
    borderColor: '#3F3F46',
    backgroundColor: '#09090B',
  },
  hoverPanel: {
    borderColor: '#71717A',
    backgroundColor: '#18181B',
  },
  text: { fg: '#A1A1AA' },
  cta: { fg: '#2563EB' },
  label: { fg: '#71717A' },
};

// ── Height helper ───────────────────────────────────────────

function wrapLineCount(text: string, width: number): number {
  const value = (text || '').trim();
  if (!value) return 0;

  const segments = value.split('\n');
  let totalLines = 0;

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) {
      totalLines++;
      continue;
    }

    const words = trimmed.split(/\s+/);
    let lines = 1;
    let current = 0;
    for (const word of words) {
      if (current === 0) {
        current = word.length;
      } else if (current + 1 + word.length <= width) {
        current += 1 + word.length;
      } else {
        lines++;
        current = word.length;
      }
    }
    totalLines += lines;
  }

  return totalLines;
}

/**
 * Create a ready-to-use Gravity ad card for OpenTUI.
 *
 * Handles layout creation, content population, height calculation,
 * impression firing, click-to-open-browser, and hover affordance.
 * Override any visual property via the options or mutate the returned
 * `elements` directly — no lock-in.
 *
 * @example
 * ```ts
 * import { createGravityAdCard } from '@gravity-ai/api/opentui';
 *
 * const adCard = createGravityAdCard({ renderer, input });
 * root.add(adCard.panel);
 *
 * // When you receive an ad:
 * adCard.showAd(ads[0]);
 *
 * // To hide:
 * adCard.clear();
 * ```
 */
export function createGravityAdCard(options: GravityAdCardOptions): GravityAdCard {
  const {
    renderer,
    input,
    variant = 'card',
    onImpression,
    onClick,
  } = options;

  const panelStyle = { ...CARD_DEFAULTS.panel, ...options.panel };
  const hoverStyle = { ...CARD_DEFAULTS.hoverPanel, ...options.hoverPanel };
  const textStyle = { ...CARD_DEFAULTS.text, ...options.text };
  const ctaStyle = { ...CARD_DEFAULTS.cta, ...options.cta };
  const labelStyle = { ...CARD_DEFAULTS.label, ...options.label };

  // Dynamically import OpenTUI classes. They're peer dependencies —
  // we import lazily so the module doesn't fail if @opentui/core
  // isn't installed (the types are `any` anyway).
  let BoxRenderable: any;
  let TextRenderable: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const core = require('@opentui/core');
    BoxRenderable = core.BoxRenderable;
    TextRenderable = core.TextRenderable;
  } catch {
    throw new Error(
      'createGravityAdCard() requires @opentui/core as a peer dependency. ' +
      'Install it with: bun add @opentui/core',
    );
  }

  const isCard = variant === 'card';

  // ── Build renderable tree ───────────────────────────────

  const adPanel = new BoxRenderable(renderer, {
    width: '100%',
    visible: false,
    flexDirection: 'column',
    ...(isCard
      ? {
          border: true,
          borderStyle: panelStyle.borderStyle,
          borderColor: panelStyle.borderColor,
          backgroundColor: panelStyle.backgroundColor,
          paddingLeft: 2,
          paddingRight: 2,
        }
      : {
          border: false,
          paddingLeft: 1,
        }),
  });

  const adLabel = new TextRenderable(renderer, {
    position: 'absolute',
    top: 0,
    right: isCard ? 2 : 0,
    wrapMode: 'none',
    content: '',
    fg: labelStyle.fg,
  });

  const adText = new TextRenderable(renderer, {
    width: '100%',
    wrapMode: 'word',
    content: '',
    fg: textStyle.fg,
  });

  const adCta = new TextRenderable(renderer, {
    wrapMode: 'none',
    content: '',
    fg: ctaStyle.fg,
  });

  adPanel.add(adLabel);
  adPanel.add(adText);
  adPanel.add(adCta);

  // ── Hover affordance ────────────────────────────────────

  function applyHover(hovered: boolean) {
    if (!isCard) return;
    if (hovered) {
      adPanel.borderColor = hoverStyle.borderColor;
      adPanel.backgroundColor = hoverStyle.backgroundColor;
    } else {
      adPanel.borderColor = panelStyle.borderColor;
      adPanel.backgroundColor = panelStyle.backgroundColor;
    }
  }

  // ── Wire tracking ───────────────────────────────────────

  const tracking = gravityAdTracking({
    renderer,
    input,
    panel: adPanel,
    clickTargets: [adLabel, adText, adCta],
    onImpression,
    onClick,
    onHoverIn: () => {
      applyHover(true);
      input.blur();
      renderer.setCursorStyle({ cursor: 'pointer', style: 'block', blinking: false });
      renderer.setMousePointer('pointer');
    },
    onHoverOut: () => {
      applyHover(false);
      renderer.setCursorStyle({ cursor: 'default', style: 'block', blinking: false });
      renderer.setMousePointer('default');
      input.focus();
    },
  });

  // ── showAd / clear ─────────────────────────────────────

  function clear() {
    tracking.clear();
    adLabel.content = '';
    adText.content = '';
    adCta.content = '';
    applyHover(false);
  }

  function showAd(ad: Ad | null) {
    if (!ad) {
      clear();
      return;
    }

    const title = ad.title || ad.brandName || 'Sponsored';
    const body = ad.adText || '';
    const cta = ad.cta || '';

    adLabel.content = 'Ad';
    adText.content = body ? `${title}\n${body}` : title;
    adCta.content = cta;

    // Compute explicit height so OpenTUI doesn't overlap siblings.
    const contentWidth = Math.max(24, (process.stdout.columns || 80) - 10);
    const titleLines = wrapLineCount(title, contentWidth);
    const bodyLines = wrapLineCount(body, contentWidth);
    const ctaLines = cta ? 1 : 0;
    const borderPad = isCard ? 2 : 0;
    adText.height = titleLines + bodyLines;
    adPanel.height = titleLines + bodyLines + ctaLines + borderPad;

    applyHover(false);
    tracking.setAd(ad);
    renderer.requestRender();
  }

  return {
    panel: adPanel,
    showAd,
    clear,
    elements: {
      text: adText,
      cta: adCta,
      label: adLabel,
    },
    tracking,
  };
}

