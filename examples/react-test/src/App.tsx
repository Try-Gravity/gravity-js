import { useState, useEffect, useRef, Component, type CSSProperties, type ReactNode } from 'react';
import { GravityAd } from '@gravity-ai/react';
import type { AdResponse, GravityAdVariant, GravityAdSlotProps } from '@gravity-ai/react';
import { ContextRenderer, CONTEXT_INTERFACES, type ContextInterfaceId } from './contexts';

class AdErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (this.props.fallback ?? (
        <div style={{ padding: 24, color: 'var(--muted)', fontSize: 12, textAlign: 'center' }}>
          Preview unavailable
        </div>
      )) as ReactNode;
    }
    return this.props.children;
  }
}

// ── Template definitions ─────────────────────────────────────────

interface PresetColors { bg: string; fg: string; muted: string; border: string; cta: string; ctaFg: string; shadow: string; }

interface Template {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  variant: GravityAdVariant;
  radius: number;
  borderWidth: number;
  showBrand: boolean;
  showTitle: boolean;
  showCta: boolean;
  showLabel: boolean;
  labelText: string;
  light: PresetColors;
  dark: PresetColors;
  extraStyle?: CSSProperties;
  extraSlotProps?: { light?: GravityAdSlotProps; dark?: GravityAdSlotProps };
}

const E: PresetColors = { bg: '', fg: '', muted: '', border: '', cta: '', ctaFg: '', shadow: '' };

const TEMPLATES: Template[] = [
  // ── Cards ──────────────────────────────────────────────────────
  { id: 'card', name: 'Card', description: 'Full card with headline, body, and button CTA',
    bestFor: 'Between messages in AI chat, or below search results',
    variant: 'card', radius: 10, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'floating', name: 'Floating', description: 'Elevated card with prominent shadow',
    bestFor: 'Hero placement between content sections or after key responses',
    variant: 'card', radius: 16, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Ad',
    light: { bg: '#FFFFFF', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.5)', border: 'rgba(0,0,0,0.04)', cta: '', ctaFg: '', shadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
    dark: { bg: 'rgba(255,255,255,0.05)', fg: '#E8E8E8', muted: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.08)', cta: '', ctaFg: '', shadow: '0 8px 32px rgba(0,0,0,0.4)' } },
  { id: 'glass', name: 'Glass', description: 'Frosted glass effect with backdrop blur',
    bestFor: 'Overlay on visual backgrounds, or premium AI assistant UIs',
    variant: 'card', radius: 16, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: 'rgba(255,255,255,0.7)', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.5)', border: 'rgba(0,0,0,0.06)', cta: '', ctaFg: '', shadow: '0 2px 16px rgba(0,0,0,0.04)' },
    dark: { bg: 'rgba(255,255,255,0.04)', fg: '#F0F0F0', muted: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.08)', cta: '', ctaFg: '', shadow: '0 4px 24px rgba(0,0,0,0.3)' },
    extraStyle: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } },
  { id: 'outlined', name: 'Outlined', description: 'Ghost-style with outline border, no fill',
    bestFor: 'Clean, sparse interfaces where the ad should feel lightweight',
    variant: 'card', radius: 12, borderWidth: 1.5,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: 'transparent', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.5)', border: 'rgba(0,0,0,0.1)', cta: 'transparent', ctaFg: '#1A1A1A', shadow: 'none' },
    dark: { bg: 'transparent', fg: '#E0E0E0', muted: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)', cta: 'transparent', ctaFg: '#E0E0E0', shadow: 'none' },
    extraSlotProps: {
      light: { cta: { style: { border: '1.5px solid rgba(0,0,0,0.1)' } } },
      dark: { cta: { style: { border: '1.5px solid rgba(255,255,255,0.1)' } } },
    } },
  { id: 'tinted', name: 'Tinted', description: 'Brand-color tinted background',
    bestFor: 'Brand-forward placements in dashboards or sidebars',
    variant: 'card', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: 'rgba(37,99,235,0.05)', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.55)', border: 'rgba(37,99,235,0.15)', cta: '#2563EB', ctaFg: '#FFFFFF', shadow: 'none' },
    dark: { bg: 'rgba(99,102,241,0.10)', fg: '#F0F0F0', muted: 'rgba(255,255,255,0.55)', border: 'rgba(99,102,241,0.22)', cta: '#6366F1', ctaFg: '#FFFFFF', shadow: 'none' } },

  // ── Panels ─────────────────────────────────────────────────────
  { id: 'accent', name: 'Accent', description: 'Top color bar with brand-colored CTA link',
    bestFor: 'Sidebar panels or between content blocks',
    variant: 'accent', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'embed', name: 'Embed', description: 'URL preview card with hero gradient header',
    bestFor: 'Link preview style within AI responses or resource panels',
    variant: 'embed', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },
  { id: 'side-panel', name: 'Side Panel', description: 'Icon sidebar with content area',
    bestFor: 'Fixed sidebar, rail, or secondary content area',
    variant: 'side-panel', radius: 12, borderWidth: 1,
    showBrand: false, showTitle: true, showCta: true, showLabel: true, labelText: 'Ad',
    light: E, dark: E },
  { id: 'split-action', name: 'Split Action', description: 'Two distinct CTA paths at the bottom',
    bestFor: 'Decision points where users choose between options',
    variant: 'split-action', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'labeled', name: 'Labeled', description: 'Vertical AD label column on the left side',
    bestFor: 'Editorial feeds or content lists where clear ad marking is needed',
    variant: 'labeled', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'AD',
    light: E, dark: E },

  // ── Overlays ───────────────────────────────────────────────────
  { id: 'bubble', name: 'Bubble', description: 'Looks like a chat message from the brand',
    bestFor: 'Chat interfaces where it feels like a message from the brand',
    variant: 'bubble', radius: 16, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'notification', name: 'Notification', description: 'Toast-style notification with timestamp',
    bestFor: 'Notification area, toast stack, or activity feed',
    variant: 'notification', radius: 14, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: false, showLabel: true, labelText: 'ad',
    light: E, dark: E },
  { id: 'tooltip', name: 'Tooltip', description: 'Small popover with pointer arrow',
    bestFor: 'Contextual hover, popover menus, or help panels',
    variant: 'tooltip', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  // ── Compact ────────────────────────────────────────────────────
  { id: 'banner', name: 'Banner', description: 'Full-width thin strip with CTA button',
    bestFor: 'Top or bottom of viewport, or between content sections',
    variant: 'banner', radius: 8, borderWidth: 1,
    showBrand: false, showTitle: true, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },
  { id: 'compact-bar', name: 'Compact Bar', description: 'Single-line bar within conversation flow',
    bestFor: 'Between chat messages or within message streams',
    variant: 'inline', radius: 10, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'toolbar', name: 'Toolbar', description: 'Floating bar with shadow, icon, text, and CTA',
    bestFor: 'Floating near input areas, bottom of view, or action bars',
    variant: 'toolbar', radius: 12, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },
  { id: 'pill', name: 'Pill', description: 'Compact rounded pill, minimal footprint',
    bestFor: 'Near search bars, suggestion chips, or compact UI areas',
    variant: 'pill', radius: 100, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: false, showLabel: true, labelText: 'ad',
    light: E, dark: E },
  { id: 'divider', name: 'Divider', description: 'Sits between messages as a branded divider',
    bestFor: 'Between messages or sections as a subtle content break',
    variant: 'divider', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },
  { id: 'suggestion', name: 'Suggestion', description: 'Styled as a suggested follow-up action',
    bestFor: 'Among suggested prompts, quick replies, or action chips',
    variant: 'suggestion', radius: 100, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  // ── Text ───────────────────────────────────────────────────────
  { id: 'native', name: 'Native', description: 'Content-first block blending with AI responses',
    bestFor: 'Within AI response text as a contextual recommendation',
    variant: 'native', radius: 14, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'quote', name: 'Quote', description: 'Styled like a blockquote recommendation',
    bestFor: 'Inside AI responses as a cited source or reference',
    variant: 'quote', radius: 10, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },
  { id: 'minimal', name: 'Minimal', description: 'Borderless text block with embedded link CTA',
    bestFor: 'Text-heavy interfaces where the ad should feel like content',
    variant: 'minimal', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'footnote', name: 'Footnote', description: 'Appears as a citation at the end of a response',
    bestFor: 'End of AI responses as a source or citation link',
    variant: 'footnote', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'sponsored',
    light: E, dark: E },
  { id: 'text-link', name: 'Text Link', description: 'Branded link with favicon, name, badge, and ad copy',
    bestFor: 'Within AI-generated content or resource lists',
    variant: 'text-link', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: false, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
  { id: 'hyperlink', name: 'Hyperlink', description: 'Text link with ad label that blends into paragraphs',
    bestFor: 'Embedded within paragraph text in AI responses',
    variant: 'hyperlink', radius: 0, borderWidth: 0,
    showBrand: false, showTitle: false, showCta: false, showLabel: true, labelText: 'ad',
    light: E, dark: E },
];


// ── Dark mode ad defaults ────────────────────────────────────────
function darkAdSlots(variant: GravityAdVariant): GravityAdSlotProps {
  const isTransparent = variant === 'minimal' || variant === 'footnote' || variant === 'divider' || variant === 'native' || variant === 'quote';

  const base: GravityAdSlotProps = {
    container: { style: {
      color: '#FAFAFA',
      background: isTransparent ? 'transparent' : 'rgba(255,255,255,0.04)',
      borderColor: isTransparent ? 'transparent' : 'rgba(255,255,255,0.08)',
      boxShadow: isTransparent ? 'none' : undefined,
    } },
    brand: { style: { color: '#FAFAFA' } },
    title: { style: { color: '#FAFAFA' } },
    text: { style: { color: '#A1A1AA' } },
    label: { style: { color: '#A1A1AA', borderColor: 'rgba(255,255,255,0.1)' } },
    cta: { style: { color: '#A5B4FC' } },
    iconWrapper: { style: { background: 'rgba(255,255,255,0.06)' } },
    footer: { style: { color: '#A1A1AA' } },
    accentBar: { style: { background: '#818CF8' } },
    contextHeader: { style: { color: 'rgba(255,255,255,0.25)' } },
  };

  if (variant === 'tooltip') {
    base.container = { style: { ...base.container!.style, background: '#27272A', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' } };
    base.arrow = { style: { background: '#27272A', borderColor: 'rgba(255,255,255,0.1)' } };
    base.cta = { style: { background: '#3B82F6', color: '#FFFFFF' } };
  }

  if (variant === 'notification') {
    base.container = { style: { ...base.container!.style, background: '#27272A', borderColor: 'transparent', boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' } };
  }

  if (variant === 'toolbar') {
    base.container = { style: { ...base.container!.style, background: '#27272A', borderColor: 'transparent', boxShadow: '0 2px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' } };
    base.cta = { style: { background: 'rgba(255,255,255,0.1)', color: '#FAFAFA' } };
  }

  if (variant === 'minimal' || variant === 'native') {
    base.container = { style: { ...base.container!.style, borderLeftColor: 'rgba(255,255,255,0.12)' } };
  }

  if (variant === 'bubble') {
    base.container = { style: { ...base.container!.style, background: 'transparent', borderColor: 'transparent', boxShadow: 'none' } };
    base.inner = { style: { background: 'rgba(255,255,255,0.06)' } };
    base.brand = { style: { color: 'rgba(255,255,255,0.5)' } };
    base.label = { style: { color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', borderColor: 'transparent' } };
  }

  if (variant === 'card' || variant === 'inline') {
    base.cta = { style: { background: '#3B82F6', color: '#FFFFFF' } };
  }

  if (variant === 'suggestion') {
    base.container = { style: { ...base.container!.style, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' } };
  }

  if (variant === 'split-action') {
    base.footer = { style: { color: '#A1A1AA', borderColor: 'rgba(255,255,255,0.06)' } };
    base.secondaryCta = { style: { color: '#A1A1AA', borderColor: 'rgba(255,255,255,0.06)' } };
  }

  if (variant === 'banner') {
    base.cta = { style: { background: '#FAFAFA', color: '#18181B' } };
  }

  if (variant === 'embed') {
    base.iconWrapper = { style: { background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))' } };
  }

  if (variant === 'side-panel') {
    base.container = { style: { ...base.container!.style, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' } };
    base.iconWrapper = { style: { background: 'rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.06)' } };
  }

  if (variant === 'labeled') {
    base.footer = { style: { background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', color: '#A1A1AA' } };
  }

  if (variant === 'quote') {
    base.container = { style: { ...base.container!.style, background: 'rgba(255,255,255,0.02)', borderLeftColor: '#818CF8' } };
  }

  if (variant === 'native') {
    base.container = { style: { ...base.container!.style, background: 'transparent', borderLeftColor: 'rgba(255,255,255,0.12)' } };
  }

  if (variant === 'footnote') {
    base.cta = { style: { color: '#A5B4FC' } };
  }

  if (variant === 'hyperlink') {
    base.container = { style: { color: '#93C5FD', background: 'none', borderColor: 'transparent', boxShadow: 'none' } };
    base.text = { style: { color: 'inherit', textDecorationColor: 'rgba(147,197,253,0.4)' } };
    base.label = { style: { color: 'rgba(147,197,253,0.5)', borderColor: 'transparent' } };
  }

  if (variant === 'text-link') {
    base.container = { style: { color: '#93C5FD', background: 'none', borderColor: 'transparent', boxShadow: 'none' } };
    base.brand = { style: { color: '#FAFAFA' } };
    base.text = { style: { color: 'inherit', textDecorationColor: 'rgba(147,197,253,0.4)' } };
    base.label = { style: { color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', borderColor: 'transparent' } };
  }

  return base;
}

// ── Helpers ──────────────────────────────────────────────────────
function mergeSlotProps(base: GravityAdSlotProps | undefined, custom: GravityAdSlotProps | undefined): GravityAdSlotProps | undefined {
  if (!base && !custom) return undefined;
  if (!base) return custom;
  if (!custom) return base;
  const result: GravityAdSlotProps = { ...base };
  for (const key of Object.keys(custom) as (keyof GravityAdSlotProps)[]) {
    const b = base[key];
    const c = custom[key];
    if (c) {
      result[key] = { style: { ...(b?.style || {}), ...(c.style || {}) }, className: c.className || b?.className };
    }
  }
  return result;
}

const LINK_CTA_VARIANTS = new Set<GravityAdVariant>([
  'accent', 'bubble', 'native', 'footnote', 'quote', 'labeled', 'side-panel', 'divider', 'split-action', 'embed', 'minimal',
]);
const NO_CTA_VARIANTS = new Set<GravityAdVariant>([
  'notification', 'pill', 'suggestion', 'text-link', 'hyperlink',
]);
const HAS_ACCENT_VARIANTS = new Set<GravityAdVariant>([
  'accent', 'quote', 'native', 'suggestion', 'side-panel', 'embed', 'notification',
]);

function buildCustomSlotProps(p: { bg: string; fg: string; muted: string; borderColor: string; cta: string; ctaFg: string }, variant: GravityAdVariant): GravityAdSlotProps | undefined {
  if (!p.bg && !p.fg && !p.muted && !p.borderColor && !p.cta && !p.ctaFg) return undefined;
  const isLinkCta = LINK_CTA_VARIANTS.has(variant);
  return {
    ...(p.bg || p.borderColor ? { container: { style: { ...(p.bg ? { background: p.bg } : {}), ...(p.borderColor ? { borderColor: p.borderColor } : {}) } } } : {}),
    ...(p.fg ? { brand: { style: { color: p.fg } }, title: { style: { color: p.fg } } } : {}),
    ...(p.muted ? { text: { style: { color: p.muted } }, label: { style: { color: p.muted, ...(p.borderColor ? { borderColor: p.borderColor } : {}) } } } : {}),
    ...(p.cta || p.ctaFg ? { cta: { style: isLinkCta
      ? { ...(p.cta ? { color: p.cta } : {}), ...(p.ctaFg ? {} : {}) }
      : { ...(p.cta ? { background: p.cta } : {}), ...(p.ctaFg ? { color: p.ctaFg } : {}) }
    } } : {}),
  };
}

function buildCode(
  mode: 'light' | 'dark', v: GravityAdVariant, showLabel: boolean, lt: string,
  showBrand: boolean, showTitle: boolean, showCta: boolean,
  p: { bg: string; fg: string; muted: string; cta: string; ctaFg: string; borderColor: string; borderWidth: number; shadow: string; radius: number; accentColor: string; extraStyle?: CSSProperties },
): string {
  const hasCustom = !!(p.bg || p.fg || p.muted || p.cta || p.ctaFg || p.borderColor);
  const useDarkBase = mode === 'dark' && !hasCustom && !p.accentColor;
  const l: string[] = [`<GravityAd`, `  ad={ad}`];
  if (v !== 'card') l.push(`  variant="${v}"`);
  if (!showLabel) l.push(`  showLabel={false}`);
  else if (lt && lt !== 'Sponsored') l.push(`  labelText="${lt}"`);
  const styleParts: string[] = [];
  if (p.radius !== 10) styleParts.push(`borderRadius: ${p.radius}`);
  if (p.shadow) styleParts.push(`boxShadow: '${p.shadow}'`);
  if (p.borderWidth !== 1) styleParts.push(`borderWidth: ${p.borderWidth}`);
  if (p.extraStyle) {
    for (const [k, val] of Object.entries(p.extraStyle)) {
      styleParts.push(`${k}: '${val}'`);
    }
  }
  if (styleParts.length) l.push(`  style={{ ${styleParts.join(', ')} }}`);
  const hasAccent = !!p.accentColor;
  if (useDarkBase || hasCustom || hasAccent) {
    l.push(`  slotProps={{`);
    if (useDarkBase) {
      const isTransparent = ['minimal', 'footnote', 'divider', 'native', 'quote', 'hyperlink', 'text-link'].includes(v);
      const isBubble = v === 'bubble';
      const isButtonCta = ['card', 'inline', 'tooltip'].includes(v);

      if (isBubble) {
        l.push(`    container: { style: { background: 'transparent', border: 'none', boxShadow: 'none' } },`);
        l.push(`    inner: { style: { background: 'rgba(255,255,255,0.06)' } },`);
      } else if (v === 'tooltip') {
        l.push(`    container: { style: { background: '#27272A', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' } },`);
      } else if (v === 'notification') {
        l.push(`    container: { style: { background: '#27272A', borderColor: 'transparent', boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' } },`);
      } else if (v === 'toolbar') {
        l.push(`    container: { style: { background: '#27272A', borderColor: 'transparent', boxShadow: '0 2px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' } },`);
      } else if (v === 'suggestion') {
        l.push(`    container: { style: { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' } },`);
      } else if (v === 'quote') {
        l.push(`    container: { style: { background: 'rgba(255,255,255,0.02)', borderLeftColor: '#818CF8' } },`);
      } else if (v === 'native' || v === 'minimal') {
        l.push(`    container: { style: { background: 'transparent', borderLeftColor: 'rgba(255,255,255,0.12)' } },`);
      } else if (v === 'hyperlink' || v === 'text-link') {
        l.push(`    container: { style: { color: '#93C5FD', background: 'none', borderColor: 'transparent', boxShadow: 'none' } },`);
      } else if (isTransparent) {
        l.push(`    container: { style: { background: 'transparent', borderColor: 'transparent' } },`);
      } else {
        l.push(`    container: { style: { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' } },`);
      }
      if (v === 'hyperlink') {
        l.push(`    text: { style: { color: 'inherit', textDecorationColor: 'rgba(147,197,253,0.4)' } },`);
        l.push(`    label: { style: { color: 'rgba(147,197,253,0.5)', borderColor: 'transparent' } },`);
      } else if (v === 'text-link') {
        l.push(`    brand: { style: { color: '#FAFAFA' } },`);
        l.push(`    text: { style: { color: 'inherit', textDecorationColor: 'rgba(147,197,253,0.4)' } },`);
        l.push(`    label: { style: { color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', borderColor: 'transparent' } },`);
      } else {
        if (isBubble) {
          l.push(`    brand: { style: { color: 'rgba(255,255,255,0.5)' } },`);
        } else {
          l.push(`    brand: { style: { color: '#FAFAFA' } },`);
        }
        l.push(`    title: { style: { color: '#FAFAFA' } },`);
        l.push(`    text: { style: { color: '#A1A1AA' } },`);
        if (isBubble) {
          l.push(`    label: { style: { color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)' } },`);
        } else {
          l.push(`    label: { style: { color: '#A1A1AA', borderColor: 'rgba(255,255,255,0.1)' } },`);
        }
      }
      if (isButtonCta) {
        l.push(`    cta: { style: { background: '#3B82F6', color: '#FFFFFF' } },`);
      } else if (v === 'toolbar') {
        l.push(`    cta: { style: { background: 'rgba(255,255,255,0.1)', color: '#FAFAFA' } },`);
      } else if (v === 'banner') {
        l.push(`    cta: { style: { background: '#FAFAFA', color: '#18181B' } },`);
      } else if (!NO_CTA_VARIANTS.has(v)) {
        l.push(`    cta: { style: { color: '#A5B4FC' } },`);
      }
      if (v === 'accent') l.push(`    accentBar: { style: { background: '#818CF8' } },`);
      if (v === 'tooltip') l.push(`    arrow: { style: { background: '#27272A', borderColor: 'rgba(255,255,255,0.1)' } },`);
    } else {
      const cs: string[] = [];
      if (p.bg) cs.push(`background: '${p.bg}'`);
      if (p.borderColor) cs.push(`borderColor: '${p.borderColor}'`);
      if (hasAccent && (v === 'quote' || v === 'native')) cs.push(`borderLeftColor: '${p.accentColor}'`);
      if (cs.length) l.push(`    container: { style: { ${cs.join(', ')} } },`);
      if (p.fg) l.push(`    brand: { style: { color: '${p.fg}' } },`);
      if (p.fg) l.push(`    title: { style: { color: '${p.fg}' } },`);
      if (p.muted) l.push(`    text: { style: { color: '${p.muted}' } },`);
      if (p.muted) l.push(`    label: { style: { color: '${p.muted}'${p.borderColor ? `, borderColor: '${p.borderColor}'` : ''} } },`);
      if (p.cta || p.ctaFg) {
        const isLink = LINK_CTA_VARIANTS.has(v);
        const cp: string[] = [];
        if (p.cta) cp.push(isLink ? `color: '${p.cta}'` : `background: '${p.cta}'`);
        if (p.ctaFg && !isLink) cp.push(`color: '${p.ctaFg}'`);
        if (cp.length) l.push(`    cta: { style: { ${cp.join(', ')} } },`);
      }
    }
    if (hasAccent) {
      if (v === 'accent') l.push(`    accentBar: { style: { background: '${p.accentColor}' } },`);
      else if (v !== 'quote' && v !== 'native') l.push(`    iconWrapper: { style: { background: '${p.accentColor}' } },`);
    }
    l.push(`  }}`);
  }
  l.push(`/>`);

  const hidden: string[] = [];
  if (!showBrand) hidden.push('brandName', 'favicon');
  if (!showTitle) hidden.push('title');
  if (!showCta) hidden.push('cta');
  if (hidden.length) {
    l.push('');
    l.push(`// The component auto-hides missing ad fields.`);
    l.push(`// This layout omits: ${hidden.join(', ')}`);
  }

  return l.join('\n');
}


const CONTEXT_PICKS: {
  id: ContextInterfaceId;
  label: string;
  subtitle: string;
  icon: ReactNode;
  picks: { templateId: string; reason: string }[];
}[] = [
  {
    id: 'chat',
    label: 'AI Chat',
    subtitle: 'ChatGPT, Claude, custom chatbots',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    picks: [
      { templateId: 'bubble', reason: 'Feels like a message from the brand' },
      { templateId: 'card', reason: 'Clear visual break between messages' },
      { templateId: 'native', reason: 'Blends into AI response text' },
      { templateId: 'suggestion', reason: 'Sits among suggested follow-ups' },
    ],
  },
  {
    id: 'search',
    label: 'AI Search',
    subtitle: 'Perplexity-style, knowledge engines',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    picks: [
      { templateId: 'quote', reason: 'Looks like a cited source in the answer' },
      { templateId: 'text-link', reason: 'Reads like a reference link in results' },
      { templateId: 'embed', reason: 'URL preview card alongside sources' },
      { templateId: 'banner', reason: 'Full-width strip between answer sections' },
    ],
  },
  {
    id: 'ide',
    label: 'Code Assistant',
    subtitle: 'Cursor, Copilot-style IDEs',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    picks: [
      { templateId: 'tooltip', reason: 'Contextual popover near code suggestions' },
      { templateId: 'side-panel', reason: 'Fits the sidebar layout of IDE panels' },
      { templateId: 'compact-bar', reason: 'Thin inline bar between suggestions' },
      { templateId: 'footnote', reason: 'Citation at the end of assistant responses' },
    ],
  },
  {
    id: 'agent',
    label: 'AI Agent',
    subtitle: 'Autonomous task runners, workflows',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="12" cy="14" r="2"/><path d="M12 16v2"/></svg>,
    picks: [
      { templateId: 'notification', reason: 'Toast-style alert within task progress' },
      { templateId: 'toolbar', reason: 'Floating bar near action areas' },
      { templateId: 'card', reason: 'Clear placement between task steps' },
      { templateId: 'divider', reason: 'Subtle branded break between steps' },
    ],
  },
];

const TEMPLATE_BEST_CONTEXT: Record<string, ContextInterfaceId> = (() => {
  const map: Record<string, ContextInterfaceId> = {};
  for (const ctx of CONTEXT_PICKS) {
    for (const pick of ctx.picks) {
      if (!map[pick.templateId]) map[pick.templateId] = ctx.id;
    }
  }
  const defaults: Record<string, ContextInterfaceId> = {
    floating: 'chat', glass: 'chat', outlined: 'chat', tinted: 'chat',
    'split-action': 'chat', labeled: 'chat', minimal: 'chat',
    pill: 'search', hyperlink: 'search',
  };
  for (const [id, ctx] of Object.entries(defaults)) {
    if (!map[id]) map[id] = ctx;
  }
  return map;
})();

function getTemplatePreviewProps(t: Template, mode: 'light' | 'dark') {
  const ad: AdResponse = {
    brandName: t.showBrand ? 'Gravity' : undefined,
    title: t.showTitle ? 'AI-Native Advertising' : undefined,
    adText: 'Monetize your AI platform with contextual ads that feel native.',
    cta: t.showCta ? 'Learn More' : undefined,
    url: 'https://example.com',
    favicon: 'https://www.trygravity.ai/favicon.png',
    clickUrl: 'https://example.com', impUrl: '',
  };
  const c = mode === 'dark' ? t.dark : t.light;
  const hasCustom = !!(c.bg || c.fg || c.muted || c.border || c.cta || c.ctaFg);
  const baseSlots = mode === 'dark' && !hasCustom ? darkAdSlots(t.variant) : undefined;
  const customSlots = buildCustomSlotProps({ bg: c.bg, fg: c.fg, muted: c.muted, borderColor: c.border, cta: c.cta, ctaFg: c.ctaFg }, t.variant);
  const extraSlotBase = mode === 'dark' ? t.extraSlotProps?.dark : t.extraSlotProps?.light;
  const slotProps = mergeSlotProps(mergeSlotProps(baseSlots, customSlots), extraSlotBase);
  const style: CSSProperties = {
    ...(t.radius !== 10 ? { borderRadius: t.radius } : {}),
    ...(c.shadow ? { boxShadow: c.shadow } : {}),
    borderWidth: t.borderWidth,
    ...(t.extraStyle || {}),
  };
  return { ad, slotProps, style };
}

// ── Mode-aware swatch sets ───────────────────────────────────────
const SWATCHES = {
  bg:     { light: ['#FFFFFF','#F4F4F5','#F0FDF4','#0F172A','#1e1b4b'], dark: ['#18181B','#09090B','#0F172A','#052E16','#1e1b4b'] },
  fg:     { light: ['#18181B','#000000','#14532D','#0F172A','#71717A'], dark: ['#FAFAFA','#E2E8F0','#DCFCE7','#e0e7ff','#A1A1AA'] },
  muted:  { light: ['#71717A','#52525B','#18181B','#94A3B8','#444444'], dark: ['#A1A1AA','#D4D4D8','#FAFAFA','#94A3B8','#71717A'] },
  cta:    { light: ['#2563EB','#16A34A','#7c3aed','#DC2626','#18181B'], dark: ['#2563EB','#38BDF8','#16A34A','#7c3aed','#DC2626'] },
  ctaFg:  { light: ['#FFFFFF','#18181B','#F0FDF4','#EFF6FF','#FAF5FF'], dark: ['#FFFFFF','#18181B','#FAFAFA','#0F172A','#1E1B4B'] },
  border: { light: ['#E4E4E7','#D4D4D8','#BBF7D0','#000000','transparent'], dark: ['#3F3F46','#52525B','#14532D','#FFFFFF','transparent'] },
};

// ── Styles ───────────────────────────────────────────────────────
const S = {
  card: (): CSSProperties => ({
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, overflow: 'hidden', transition: 'background 200ms, border-color 200ms',
  }),
  cardInner: { padding: 16 } as CSSProperties,
  sectionLabel: {
    fontSize: 10, fontWeight: 600, color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
  } as CSSProperties,
  pill: (active: boolean): CSSProperties => ({
    padding: '5px 14px', fontSize: 12, fontWeight: 500, borderRadius: 6,
    border: '1px solid', cursor: 'pointer', transition: 'all 100ms', fontFamily: 'inherit',
    borderColor: active ? 'var(--fg)' : 'var(--border)',
    background: active ? 'var(--subtle)' : 'transparent',
    color: active ? 'var(--fg)' : 'var(--muted)',
  }),
  seg: (active: boolean): CSSProperties => ({
    padding: '5px 12px', fontSize: 12, fontWeight: 500, borderRadius: 5,
    border: 'none', cursor: 'pointer', transition: 'all 100ms', fontFamily: 'inherit',
    background: active ? 'var(--bg)' : 'transparent',
    color: active ? 'var(--fg)' : 'var(--muted)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
  }),
  segGroup: {
    display: 'inline-flex', gap: 1, background: 'var(--subtle)',
    borderRadius: 6, padding: 2, transition: 'background 200ms',
  } as CSSProperties,
  fieldLabel: { fontSize: 11, color: 'var(--muted)', marginBottom: 6 } as CSSProperties,
  input: {
    width: '100%', padding: '6px 10px', borderRadius: 6,
    border: '1px solid var(--border)', background: 'var(--subtle)',
    color: 'var(--fg)', fontSize: 12, outline: 'none', fontFamily: 'inherit',
    transition: 'background 200ms, border-color 200ms, color 200ms',
  } as CSSProperties,
  swatch: (c: string, active: boolean): CSSProperties => ({
    width: 20, height: 20, borderRadius: 4, padding: 0, background: c === 'transparent' ? undefined : c, cursor: 'pointer',
    border: `2px solid ${active ? 'var(--fg)' : 'var(--border)'}`,
    transition: 'border-color 100ms', flexShrink: 0,
    ...(c === 'transparent' ? {
      backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
      backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    } : {}),
  }),
  grid: (cols: number): CSSProperties => ({
    display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16,
  }),
  sep: { height: 1, background: 'var(--border)', margin: '4px 0', transition: 'background 200ms' } as CSSProperties,
  code: {
    fontSize: 12, lineHeight: 1.7, color: 'var(--muted)',
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    background: 'var(--subtle)', borderRadius: 8,
    padding: 16, overflow: 'auto', whiteSpace: 'pre', margin: 0,
    transition: 'background 200ms, color 200ms',
  } as CSSProperties,
};

// ── UI primitives ────────────────────────────────────────────────
function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div style={S.card()}>
      <div style={S.cardInner}>
        {title && <div style={S.sectionLabel}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

function Seg({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={S.segGroup}>
      {options.map(o => <button key={o} onClick={() => onChange(o)} style={S.seg(value === o)}>{o}</button>)}
    </div>
  );
}

function ColorPicker({ label, value, onChange, swatches }: { label: string; value: string; onChange: (c: string) => void; swatches: string[] }) {
  return (
    <div>
      <div style={S.fieldLabel}>{label}</div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => onChange('')} style={{ ...S.pill(value === ''), padding: '2px 8px', fontSize: 10 }}>Auto</button>
        {swatches.map(c => <button key={c} onClick={() => onChange(c)} aria-label={c === 'transparent' ? 'Transparent' : c} style={S.swatch(c, value === c)} />)}
        <label style={{ position: 'relative', width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }}>
          <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#ffffff'} onChange={e => onChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
          <div style={{ ...S.swatch('var(--subtle)', false), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        </label>
      </div>
    </div>
  );
}


function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return { sm: w < 640, md: w >= 640 && w < 1024, lg: w >= 1024, w };
}

function FadeIn({ id, children }: { id: string; children: ReactNode }) {
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    setOpacity(0);
    const raf = requestAnimationFrame(() => setOpacity(1));
    return () => cancelAnimationFrame(raf);
  }, [id]);

  return (
    <div style={{ transition: 'opacity 200ms ease', opacity }}>
      {children}
    </div>
  );
}

function SyntaxCode({ code, mode }: { code: string; mode: 'light' | 'dark' }) {
  const c = mode === 'dark'
    ? { tag: '#E2E8F0', prop: '#93C5FD', str: '#86EFAC', comment: 'rgba(255,255,255,0.25)', num: '#FDE68A', bool: '#C4B5FD', punct: 'rgba(255,255,255,0.3)' }
    : { tag: '#1A1A1A', prop: '#2563EB', str: '#16A34A', comment: 'rgba(0,0,0,0.3)', num: '#B45309', bool: '#7C3AED', punct: 'rgba(0,0,0,0.35)' };

  const tokenize = (line: string): ReactNode[] => {
    const out: ReactNode[] = [];
    const re = /(<\/?GravityAd|\/?>|'[^']*'|"[^"]*"|\b(?:true|false)\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_]+(?=\s*[:=])|\{|\})/g;
    let last = 0, m, k = 0;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) out.push(line.slice(last, m.index));
      const t = m[0];
      const s =
        t === '<GravityAd' || t === '/>' ? { color: c.tag, fontWeight: 600 as const } :
        t.startsWith("'") || t.startsWith('"') ? { color: c.str } :
        t === 'true' || t === 'false' ? { color: c.bool } :
        /^\d/.test(t) ? { color: c.num } :
        t === '{' || t === '}' ? { color: c.punct } :
        { color: c.prop };
      out.push(<span key={k++} style={s}>{t}</span>);
      last = m.index + t.length;
    }
    if (last < line.length) out.push(line.slice(last));
    return out;
  };

  return (
    <>
      {code.split('\n').map((line, i) =>
        <div key={i}>{
          line.trimStart().startsWith('//')
            ? <span style={{ color: c.comment }}>{line}</span>
            : tokenize(line)
        }</div>
      )}
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const p = navigator.clipboard ? navigator.clipboard.writeText(text) : (() => {
      const el = document.createElement('textarea');
      el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
      document.body.appendChild(el); el.select(); document.execCommand('copy');
      document.body.removeChild(el); return Promise.resolve();
    })();
    p.then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  };
  return (
    <button onClick={copy} style={{
      position: 'absolute', top: 8, right: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600,
      borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface)',
      color: copied ? 'var(--fg)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 150ms',
    }}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}


function GalleryCard({ template, mode, onClick, reason }: { template: Template; mode: 'light' | 'dark'; onClick: () => void; reason?: string }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const isSmall = ['hyperlink', 'text-link', 'divider', 'pill', 'footnote', 'suggestion'].includes(template.variant);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '60px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const previewProps = visible ? getTemplatePreviewProps(template, mode) : null;

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? (mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)') : 'var(--border)'}`,
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-2px)' : 'none') : 'translateY(12px)',
        boxShadow: hovered
          ? mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.06)'
          : 'none',
        textAlign: 'left', fontFamily: 'inherit', padding: 0, width: '100%',
        outline: 'none',
      }}
    >
      <div
        {...{ inert: '' } as any}
        aria-hidden="true"
        style={{
          background: 'var(--subtle)', padding: 20,
          height: 180, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 200ms',
        }}
      >
        {previewProps ? (
          <div style={{
            transform: `scale(${isSmall ? 0.75 : 0.55})`,
            transformOrigin: 'center center',
            width: `calc(100% / ${isSmall ? 0.75 : 0.55})`,
            pointerEvents: 'none',
          }}>
            <AdErrorBoundary>
              <GravityAd
                ad={previewProps.ad} variant={template.variant}
                showLabel={template.showLabel} labelText={template.labelText || undefined}
                slotProps={previewProps.slotProps} style={previewProps.style} disableImpressionTracking
              />
            </AdErrorBoundary>
          </div>
        ) : (
          <div style={{ width: '60%', display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.15 }}>
            <div style={{ height: 10, borderRadius: 4, background: 'var(--fg)', width: '40%' }} />
            <div style={{ height: 8, borderRadius: 4, background: 'var(--fg)', width: '100%' }} />
            <div style={{ height: 8, borderRadius: 4, background: 'var(--fg)', width: '75%' }} />
            <div style={{ height: 24, borderRadius: 6, background: 'var(--fg)', width: '35%', marginTop: 4 }} />
          </div>
        )}
      </div>
      <div style={{
        padding: '10px 16px', borderTop: '1px solid var(--border)',
        transition: 'border-color 200ms',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', transition: 'color 200ms' }}>
          {template.name}
        </div>
      </div>
    </button>
  );
}


const FOCUS_STYLES = `
  *:focus-visible {
    outline: 1.5px solid var(--muted);
    outline-offset: 2px;
  }
  button:focus-visible {
    outline: 1.5px solid var(--muted);
    outline-offset: 2px;
  }
  input:focus-visible {
    outline: 1.5px solid var(--muted);
    outline-offset: 0px;
  }
`;

// ── Routing helpers ───────────────────────────────────────────────
function idxFromHash(): number | null {
  const id = window.location.hash.replace('#', '');
  if (!id) return null;
  const idx = TEMPLATES.findIndex(t => t.id === id);
  return idx >= 0 ? idx : null;
}

function getInitialMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// ── App ──────────────────────────────────────────────────────────
function App() {
  const bp = useBreakpoint();
  const [mode, setMode] = useState<'light' | 'dark'>(getInitialMode);
  const [selected, setSelected] = useState<number | null>(idxFromHash);

  const [template, setTemplate] = useState(idxFromHash() ?? 0);
  const [variant, setVariant] = useState<GravityAdVariant>(TEMPLATES[idxFromHash() ?? 0].variant);
  const [radius, setRadius] = useState(TEMPLATES[idxFromHash() ?? 0].radius);
  const [borderWidth, setBorderWidth] = useState(TEMPLATES[idxFromHash() ?? 0].borderWidth);

  const [showLabel, setShowLabel] = useState(true);
  const [labelText, setLabelText] = useState('Sponsored');

  const [bg, setBg] = useState('');
  const [fg, setFg] = useState('');
  const [muted, setMuted] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [cta, setCta] = useState('');
  const [ctaFg, setCtaFg] = useState('');
  const [shadow, setShadow] = useState('');
  const [accentColor, setAccentColor] = useState('');

  const [previewMode, setPreviewMode] = useState<'isolated' | 'context'>('isolated');
  const [previewWidth, setPreviewWidth] = useState<'full' | 'mobile'>('full');
  const [contextInterface, setContextInterface] = useState<ContextInterfaceId>('chat');

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.body.setAttribute('data-mode', mode);
  }, [mode]);

  useEffect(() => {
    const idx = idxFromHash();
    if (idx !== null) applyTemplate(idx);
  }, []);

  useEffect(() => {
    if (selected !== null) {
      document.title = `${TEMPLATES[template].name} · Gravity Playground`;
    } else {
      document.title = 'Gravity React SDK Playground';
    }
  }, [selected, template]);

  useEffect(() => {
    const onPop = () => {
      const idx = idxFromHash();
      if (idx !== null) {
        applyTemplate(idx);
        setSelected(idx);
      } else {
        setSelected(null);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape' && selected !== null) {
        history.pushState(null, '', window.location.pathname);
        setSelected(null);
        window.scrollTo({ top: 0 });
      }
      if (selected !== null) {
        if (e.key === 'ArrowLeft' && template > 0) openTemplate(template - 1);
        if (e.key === 'ArrowRight' && template < TEMPLATES.length - 1) openTemplate(template + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, template, mode]);

  const applyTemplate = (i: number, m: 'light' | 'dark' = mode) => {
    const t = TEMPLATES[i];
    const c = m === 'dark' ? t.dark : t.light;
    setTemplate(i);
    setVariant(t.variant); setRadius(t.radius); setBorderWidth(t.borderWidth);
    setShowLabel(t.showLabel); setLabelText(t.labelText);
    setBg(c.bg); setFg(c.fg); setMuted(c.muted); setBorderColor(c.border);
    setCta(c.cta); setCtaFg(c.ctaFg); setShadow(c.shadow); setAccentColor('');
  };

  const switchMode = (m: 'light' | 'dark') => {
    setMode(m);
    if (selected !== null) {
      const c = m === 'dark' ? TEMPLATES[template].dark : TEMPLATES[template].light;
      setBg(c.bg); setFg(c.fg); setMuted(c.muted); setBorderColor(c.border);
      setCta(c.cta); setCtaFg(c.ctaFg); setShadow(c.shadow);
    }
  };

  const openTemplate = (idx: number) => {
    applyTemplate(idx);
    setSelected(idx);
    const bestCtx = TEMPLATE_BEST_CONTEXT[TEMPLATES[idx].id];
    if (bestCtx) setContextInterface(bestCtx);
    history.pushState(null, '', `#${TEMPLATES[idx].id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── GALLERY VIEW ─────────────────────────────────────────── */
  if (selected === null) {
    return (
      <FadeIn id="gallery">
      <style dangerouslySetInnerHTML={{ __html: FOCUS_STYLES }} />

      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        transition: 'background 200ms, border-color 200ms',
      }}>
        <div style={{ padding: bp.sm ? '10px 16px' : '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <img src="/Gravity lockup black on white libre baskerville.png" alt="Gravity"
              style={{ height: bp.sm ? 20 : 26, filter: mode === 'light' ? 'invert(1)' : 'none', transition: 'filter 250ms ease', flexShrink: 0 }} />
            <span style={{
              fontFamily: "'Libre Baskerville', 'Georgia', serif",
              fontSize: bp.sm ? 14 : 16, fontWeight: 400, color: 'var(--fg)',
              opacity: 0.5, letterSpacing: '-0.01em',
            }}>Playground</span>
          </div>
          {!bp.sm && (
            <a href="https://trygravity.ai/docs" target="_blank" rel="noopener noreferrer" style={{
              fontSize: 13, fontWeight: 500, color: 'var(--muted)',
              padding: '5px 14px', borderRadius: 6, textDecoration: 'none',
              transition: 'all 150ms', fontFamily: 'inherit',
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--subtle)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; }}
            >Docs</a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: bp.sm ? 8 : 12 }}>
            <Seg options={['Light', 'Dark']} value={mode === 'light' ? 'Light' : 'Dark'} onChange={v => switchMode(v === 'Light' ? 'light' : 'dark')} />
            {!bp.sm && (
            <a href="https://app.trygravity.ai/platform/login" target="_blank" rel="noopener noreferrer" style={{
              fontSize: 13, fontWeight: 500,
              color: mode === 'dark' ? '#fff' : '#18181B',
              padding: '4px 14px 4px 4px', borderRadius: 100, textDecoration: 'none',
              transition: 'all 150ms', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8,
              background: mode === 'dark' ? '#232323' : '#fff',
              border: `1px solid ${mode === 'dark' ? '#333' : '#E4E4E7'}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = mode === 'dark' ? '#555' : '#A1A1AA'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = mode === 'dark' ? '#333' : '#E4E4E7'; }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 8,
                background: mode === 'dark' ? '#333' : '#18181B',
                border: `1px solid ${mode === 'dark' ? '#444' : '#27272A'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>
                </svg>
              </span>
              Dashboard
            </a>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: bp.sm ? '0 16px 60px' : '0 32px 80px' }}>

        {/* Hero */}
        <div style={{
          textAlign: 'center',
          padding: bp.sm ? '32px 0 28px' : '48px 0 36px',
        }}>
          <h1 style={{
            fontSize: bp.sm ? 24 : 32, fontWeight: 700, color: 'var(--fg)',
            letterSpacing: '-0.025em', margin: 0, transition: 'color 200ms',
            lineHeight: 1.2,
          }}>
            See what's possible
          </h1>
          <p style={{
            fontSize: bp.sm ? 13 : 15, color: 'var(--muted)', lineHeight: 1.6,
            maxWidth: 480, margin: '10px auto 0', transition: 'color 200ms',
          }}>
            The Gravity SDK gives you full control over how ads look and feel in your product. These are just {TEMPLATES.length} examples. You can build anything.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: bp.sm ? '1fr' : bp.md ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: bp.sm ? 12 : 16 }}>
          {TEMPLATES.map((t, i) => (
            <GalleryCard key={t.id} template={t} mode={mode} onClick={() => openTemplate(i)} />
          ))}
        </div>

        <footer style={{
          marginTop: 64, paddingTop: 20, borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'border-color 200ms',
        }}>
          <a href="https://trygravity.ai" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms', opacity: 0.6 }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.opacity = '0.6'; }}
          >trygravity.ai</a>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="https://trygravity.ai/docs" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >Docs</a>
            <a href="https://app.trygravity.ai/platform/login" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >Dashboard</a>
          </div>
        </footer>
      </div>
      </FadeIn>
    );
  }

  /* ── DETAIL VIEW ──────────────────────────────────────────── */
  const currentTemplate = TEMPLATES[template];
  const ad: AdResponse = {
    brandName: currentTemplate.showBrand ? 'Gravity' : undefined,
    title: currentTemplate.showTitle ? 'AI-Native Advertising' : undefined,
    adText: 'Monetize your AI platform with contextual ads that feel native to the conversation.',
    cta: currentTemplate.showCta ? 'Learn More' : undefined,
    url: 'https://example.com',
    favicon: 'https://www.trygravity.ai/favicon.png',
    clickUrl: 'https://example.com', impUrl: '',
  };

  const customSlots = buildCustomSlotProps({ bg, fg, muted, borderColor, cta, ctaFg }, variant);
  const hasCustomColors = !!(bg || fg || muted || borderColor || cta || ctaFg);
  const baseSlots = mode === 'dark' && !hasCustomColors ? darkAdSlots(variant) : undefined;
  const slotProps = mergeSlotProps(baseSlots, customSlots);
  const extraStyle = currentTemplate.extraStyle || {};
  const extraSlotBase = mode === 'dark' ? currentTemplate.extraSlotProps?.dark : currentTemplate.extraSlotProps?.light;

  const containerStyle: CSSProperties = {
    ...(radius !== 10 ? { borderRadius: radius } : {}),
    ...(shadow ? { boxShadow: shadow } : {}),
    borderWidth,
    ...extraStyle,
  };

  const accentSlots: GravityAdSlotProps | undefined = accentColor ? (() => {
    if (variant === 'accent') return { accentBar: { style: { background: accentColor } } };
    if (variant === 'quote') return { container: { style: { borderLeftColor: accentColor } } };
    if (variant === 'native') return { container: { style: { borderLeftColor: accentColor } } };
    if (['suggestion', 'side-panel', 'embed', 'notification'].includes(variant))
      return { iconWrapper: { style: { background: accentColor } } };
    return undefined;
  })() : undefined;

  const finalSlotProps = mergeSlotProps(mergeSlotProps(slotProps, extraSlotBase), accentSlots);
  const code = buildCode(mode, variant, showLabel, labelText, currentTemplate.showBrand, currentTemplate.showTitle, currentTemplate.showCta, { bg, fg, muted, cta, ctaFg, borderColor, borderWidth, shadow, radius, accentColor, extraStyle: currentTemplate.extraStyle });
  const fullCode = `import { GravityAd } from '@gravity-ai/react';\n\n${code}`;

  const prevIdx = template > 0 ? template - 1 : null;
  const nextIdx = template < TEMPLATES.length - 1 ? template + 1 : null;

  return (
    <FadeIn id={`detail-${currentTemplate.id}`}>
    <style dangerouslySetInnerHTML={{ __html: FOCUS_STYLES }} />

    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--bg)', borderBottom: '1px solid var(--border)',
      transition: 'background 200ms, border-color 200ms',
    }}>
      <div style={{ padding: bp.sm ? '10px 16px' : '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer' }}
            onClick={() => { history.pushState(null, '', window.location.pathname); setSelected(null); window.scrollTo({ top: 0 }); }}
          >
          <img src="/Gravity lockup black on white libre baskerville.png" alt="Gravity"
            style={{ height: bp.sm ? 20 : 26, filter: mode === 'light' ? 'invert(1)' : 'none', transition: 'filter 250ms ease', flexShrink: 0 }}
          />
          <span style={{
            fontFamily: "'Libre Baskerville', 'Georgia', serif",
            fontSize: bp.sm ? 14 : 16, fontWeight: 400, color: 'var(--fg)',
            opacity: 0.5, letterSpacing: '-0.01em',
          }}>Playground</span>
        </div>
        {!bp.sm && (
          <a href="https://trygravity.ai/docs" target="_blank" rel="noopener noreferrer" style={{
            fontSize: 13, fontWeight: 500, color: 'var(--muted)',
            padding: '5px 14px', borderRadius: 6, textDecoration: 'none',
            transition: 'all 150ms', fontFamily: 'inherit',
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--subtle)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent'; }}
          >Docs</a>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: bp.sm ? 8 : 12 }}>
          <Seg options={['Light', 'Dark']} value={mode === 'light' ? 'Light' : 'Dark'} onChange={v => switchMode(v === 'Light' ? 'light' : 'dark')} />
          {!bp.sm && (
          <a href="https://app.trygravity.ai/platform/login" target="_blank" rel="noopener noreferrer" style={{
            fontSize: 13, fontWeight: 500,
            color: mode === 'dark' ? '#fff' : '#18181B',
            padding: '4px 14px 4px 4px', borderRadius: 100, textDecoration: 'none',
            transition: 'all 150ms', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 8,
            background: mode === 'dark' ? '#232323' : '#fff',
            border: `1px solid ${mode === 'dark' ? '#333' : '#E4E4E7'}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = mode === 'dark' ? '#555' : '#A1A1AA'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = mode === 'dark' ? '#333' : '#E4E4E7'; }}
          >
            <span style={{
              width: 26, height: 26, borderRadius: 8,
              background: mode === 'dark' ? '#333' : '#18181B',
              border: `1px solid ${mode === 'dark' ? '#444' : '#27272A'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>
              </svg>
            </span>
            Dashboard
          </a>
          )}
        </div>
      </div>
    </nav>

    <div style={{ maxWidth: 1120, margin: '0 auto', padding: bp.sm ? '0 16px 60px' : '0 32px 80px' }}>
      <div style={{
        display: 'flex', alignItems: bp.sm ? 'flex-start' : 'center', justifyContent: 'space-between',
        padding: '12px 0', marginBottom: 16, gap: 8,
        flexDirection: bp.sm ? 'column' : 'row',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button
            onClick={() => { history.pushState(null, '', window.location.pathname); setSelected(null); window.scrollTo({ top: 0 }); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--muted)', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px 4px 6px', borderRadius: 6, fontFamily: 'inherit',
              transition: 'all 150ms', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--subtle)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Examples
          </button>
          <span style={{ color: 'var(--border)', fontWeight: 300, flexShrink: 0 }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', transition: 'color 200ms', flexShrink: 0 }}>
            {currentTemplate.name}
          </span>
          {!bp.sm && (
          <span style={{ fontSize: 12, color: 'var(--muted)', transition: 'color 200ms' }}>
            {currentTemplate.description}
          </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button
            disabled={prevIdx === null}
            onClick={() => prevIdx !== null && openTemplate(prevIdx)}
            style={{ ...S.seg(false), padding: '4px 6px', opacity: prevIdx === null ? 0.3 : 1, cursor: prevIdx === null ? 'default' : 'pointer' }}
            aria-label="Previous example"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            disabled={nextIdx === null}
            onClick={() => nextIdx !== null && openTemplate(nextIdx)}
            style={{ ...S.seg(false), padding: '4px 6px', opacity: nextIdx === null ? 0.3 : 1, cursor: nextIdx === null ? 'default' : 'pointer' }}
            aria-label="Next example"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: bp.sm ? '1fr' : bp.md ? '1fr 320px' : '1fr 360px', gap: 16 }}>
        {/* Left: preview + code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ ...S.card(), display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px', borderBottom: '1px solid var(--border)', transition: 'border-color 200ms',
          }}>
            <Seg
              options={['Isolated', 'In context']}
              value={previewMode === 'isolated' ? 'Isolated' : 'In context'}
              onChange={v => {
                const next = v === 'Isolated' ? 'isolated' : 'context';
                setPreviewMode(next as 'isolated' | 'context');
                if (next === 'context') {
                  const bestCtx = TEMPLATE_BEST_CONTEXT[currentTemplate.id];
                  if (bestCtx) setContextInterface(bestCtx);
                }
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button onClick={() => setPreviewWidth('mobile')} style={{
                ...S.seg(previewWidth === 'mobile'), padding: '4px 10px', fontSize: 11,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                {!bp.sm && 'Mobile'}
              </button>
              <button onClick={() => setPreviewWidth('full')} style={{
                ...S.seg(previewWidth === 'full'), padding: '4px 10px', fontSize: 11,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                {!bp.sm && 'Desktop'}
              </button>
            </div>
          </div>
          {previewMode === 'context' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 1,
              padding: '6px 16px', borderBottom: '1px solid var(--border)',
              transition: 'border-color 200ms',
              overflowX: 'auto',
            }}>
              {CONTEXT_INTERFACES.map(ci => (
                <button key={ci.id} onClick={() => setContextInterface(ci.id)} style={{
                  background: contextInterface === ci.id
                    ? (mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                    : 'transparent',
                  border: 'none', borderRadius: 6, padding: '5px 10px',
                  fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  color: contextInterface === ci.id ? 'var(--fg)' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'inherit', transition: 'all 150ms',
                  whiteSpace: 'nowrap',
                }}>
                  {ci.icon}
                  {ci.label}
                </button>
              ))}
            </div>
          )}
          <div style={{
            backgroundColor: 'var(--subtle)',
            padding: 20,
            display: 'flex',
            alignItems: previewMode === 'isolated' ? 'center' : 'flex-start',
            justifyContent: 'center',
            height: previewMode === 'context' ? 420 : 260,
            overflowY: 'auto',
            transition: 'background-color 200ms, height 250ms ease',
          }}>
            <div style={(() => {
              const mobileCtx = previewWidth === 'mobile' && previewMode === 'context';
              const SCALE = 0.72;
              return mobileCtx
                ? { width: Math.round(375 / SCALE), zoom: SCALE }
                : { width: '100%' as const, maxWidth: previewWidth === 'mobile' ? 375 : '100%', transition: 'max-width 300ms ease' };
            })()}>
              <FadeIn id={`${currentTemplate.id}-${previewMode}`}>
                <AdErrorBoundary>
                  {previewMode === 'context' ? (
                    <ContextRenderer interfaceId={contextInterface} mode={mode} variant={variant} adBody={ad.adText!}>
                      <GravityAd
                        ad={ad} variant={variant} showLabel={showLabel} labelText={labelText || undefined}
                        slotProps={finalSlotProps} style={containerStyle} disableImpressionTracking
                      />
                    </ContextRenderer>
                  ) : (
                    <GravityAd
                      ad={ad} variant={variant} showLabel={showLabel} labelText={labelText || undefined}
                      slotProps={finalSlotProps} style={containerStyle} disableImpressionTracking
                    />
                  )}
                </AdErrorBoundary>
              </FadeIn>
            </div>
          </div>
        </div>

          {/* Code panel — below preview */}
          <Panel title="Code">
            <div style={{ position: 'relative' }}>
              <CopyButton text={fullCode} />
              <pre style={{ ...S.code, fontSize: 11, lineHeight: 1.6 }}>
                <span style={{ opacity: 0.35 }}>
                  <span style={{ color: mode === 'dark' ? '#C4B5FD' : '#7C3AED' }}>import</span>
                  {" { "}
                  <span style={{ color: mode === 'dark' ? '#E2E8F0' : '#1A1A1A' }}>GravityAd</span>
                  {" } "}
                  <span style={{ color: mode === 'dark' ? '#C4B5FD' : '#7C3AED' }}>from</span>
                  {" "}
                  <span style={{ color: mode === 'dark' ? '#86EFAC' : '#16A34A' }}>{"'@gravity-ai/react'"}</span>
                  {"\n\n"}
                </span>
                <SyntaxCode code={code} mode={mode} />
              </pre>
            </div>
          </Panel>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Panel title="Customize">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => applyTemplate(template)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, color: 'var(--muted)',
                    fontFamily: 'inherit', padding: '2px 0', transition: 'color 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                >
                  Reset to defaults
                </button>
              </div>

              <div style={S.fieldLabel}>Colors</div>
              <ColorPicker label="Background" value={bg} onChange={setBg} swatches={SWATCHES.bg[mode]} />
              <ColorPicker label="Border" value={borderColor} onChange={setBorderColor} swatches={SWATCHES.border[mode]} />
              <ColorPicker label="Text" value={fg} onChange={setFg} swatches={SWATCHES.fg[mode]} />
              <ColorPicker label="Secondary text" value={muted} onChange={setMuted} swatches={SWATCHES.muted[mode]} />
              {!NO_CTA_VARIANTS.has(variant) && (
                <ColorPicker
                  label={LINK_CTA_VARIANTS.has(variant) ? 'CTA color' : 'CTA fill'}
                  value={cta} onChange={setCta} swatches={SWATCHES.cta[mode]}
                />
              )}
              {!NO_CTA_VARIANTS.has(variant) && !LINK_CTA_VARIANTS.has(variant) && (
                <ColorPicker label="CTA text" value={ctaFg} onChange={setCtaFg} swatches={SWATCHES.ctaFg[mode]} />
              )}
              {HAS_ACCENT_VARIANTS.has(variant) && (
                <ColorPicker
                  label={variant === 'accent' ? 'Accent bar' : variant === 'quote' || variant === 'native' ? 'Left border' : 'Icon background'}
                  value={accentColor} onChange={setAccentColor}
                  swatches={SWATCHES.cta[mode]}
                />
              )}

              <div style={S.sep} />
              <div style={S.fieldLabel}>Shape</div>
              <div>
                <div style={{ ...S.fieldLabel, fontSize: 10, opacity: 0.7 }}>Radius · {radius}px</div>
                <input type="range" min={0} max={24} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ ...S.fieldLabel, fontSize: 10, opacity: 0.7 }}>Border width · {borderWidth}px</div>
                <input type="range" min={0} max={4} step={0.5} value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div style={S.sep} />
              <div>
                <div style={S.fieldLabel}>Disclosure label</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <button onClick={() => setShowLabel(!showLabel)} style={{ ...S.pill(showLabel), padding: '4px 10px', fontSize: 11 }}>
                    {showLabel ? 'Visible' : 'Hidden'}
                  </button>
                  {showLabel && (
                    <input
                      type="text" value={labelText}
                      onChange={e => setLabelText(e.target.value)}
                      style={{ ...S.input, width: 'auto', flex: 1, padding: '4px 8px', fontSize: 11 }}
                      placeholder="e.g. Sponsored, Ad, Promoted"
                    />
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <div style={{
            padding: '10px 16px', fontSize: 10, lineHeight: 1.5,
            color: 'var(--muted)', transition: 'color 200ms',
          }}>
            Preview uses sample data. Live ads are served by Gravity's API.
          </div>
        </div>
      </div>

      <footer style={{
        marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'border-color 200ms',
      }}>
        <a href="https://trygravity.ai" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms', opacity: 0.6 }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.opacity = '0.6'; }}
        >trygravity.ai</a>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="https://trygravity.ai/docs" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >Docs</a>
          <a href="https://app.trygravity.ai/platform/login" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >Dashboard</a>
        </div>
      </footer>
    </div>
    </FadeIn>
  );
}

export default App;
