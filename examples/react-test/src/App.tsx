import { useState, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { GravityAd } from '@gravity-ai/react';
import type { AdResponse, GravityAdVariant, GravityAdSlotProps } from '@gravity-ai/react';

// ── Template definitions ─────────────────────────────────────────

interface PresetColors { bg: string; fg: string; muted: string; border: string; cta: string; ctaFg: string; shadow: string; }

interface Template {
  id: string;
  name: string;
  category: 'Cards' | 'Inline' | 'Native';
  description: string;
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

  { id: 'card', name: 'Card', category: 'Cards',
    description: 'Full card with headline, body, and button CTA',
    variant: 'card', radius: 10, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  { id: 'floating', name: 'Floating', category: 'Cards',
    description: 'Elevated card with prominent shadow',
    variant: 'card', radius: 16, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Ad',
    light: { bg: '#FFFFFF', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.5)', border: 'rgba(0,0,0,0.04)', cta: '', ctaFg: '', shadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' },
    dark: { bg: 'rgba(255,255,255,0.05)', fg: '#E8E8E8', muted: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.08)', cta: '', ctaFg: '', shadow: '0 8px 32px rgba(0,0,0,0.4)' } },

  { id: 'glass', name: 'Glass', category: 'Cards',
    description: 'Frosted glass effect with backdrop blur',
    variant: 'card', radius: 16, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: 'rgba(255,255,255,0.7)', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.5)', border: 'rgba(0,0,0,0.06)', cta: '', ctaFg: '', shadow: '0 2px 16px rgba(0,0,0,0.04)' },
    dark: { bg: 'rgba(255,255,255,0.04)', fg: '#F0F0F0', muted: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.08)', cta: '', ctaFg: '', shadow: '0 4px 24px rgba(0,0,0,0.3)' },
    extraStyle: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } },

  { id: 'outlined', name: 'Outlined', category: 'Cards',
    description: 'Ghost-style with outline border, no fill',
    variant: 'card', radius: 12, borderWidth: 1.5,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: 'transparent', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.5)', border: 'rgba(0,0,0,0.1)', cta: 'transparent', ctaFg: '#1A1A1A', shadow: 'none' },
    dark: { bg: 'transparent', fg: '#E0E0E0', muted: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)', cta: 'transparent', ctaFg: '#E0E0E0', shadow: 'none' },
    extraSlotProps: {
      light: { cta: { style: { border: '1.5px solid rgba(0,0,0,0.1)' } } },
      dark: { cta: { style: { border: '1.5px solid rgba(255,255,255,0.1)' } } },
    } },

  { id: 'tinted', name: 'Tinted', category: 'Cards',
    description: 'Brand-color tinted background',
    variant: 'card', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: { bg: 'rgba(37,99,235,0.04)', fg: '#1A1A1A', muted: 'rgba(0,0,0,0.55)', border: 'rgba(37,99,235,0.12)', cta: '#2563EB', ctaFg: '#FFFFFF', shadow: 'none' },
    dark: { bg: 'rgba(99,102,241,0.08)', fg: '#F0F0F0', muted: 'rgba(255,255,255,0.55)', border: 'rgba(99,102,241,0.2)', cta: '#6366F1', ctaFg: '#FFFFFF', shadow: 'none' } },

  { id: 'accent', name: 'Accent', category: 'Cards',
    description: 'Top color bar with brand-colored CTA link',
    variant: 'accent', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  { id: 'side-panel', name: 'Side Panel', category: 'Cards',
    description: 'Icon sidebar with content area',
    variant: 'side-panel', radius: 12, borderWidth: 1,
    showBrand: false, showTitle: true, showCta: true, showLabel: true, labelText: 'Ad',
    light: E, dark: E },

  { id: 'split-action', name: 'Split Action', category: 'Cards',
    description: 'Two distinct CTA paths at the bottom',
    variant: 'split-action', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  { id: 'notification', name: 'Notification', category: 'Cards',
    description: 'Toast-style notification with timestamp',
    variant: 'notification', radius: 14, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: false, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'labeled', name: 'Labeled', category: 'Cards',
    description: 'Vertical AD label column on the left side',
    variant: 'labeled', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'AD',
    light: E, dark: E },

  { id: 'embed', name: 'Embed', category: 'Cards',
    description: 'URL preview card with hero gradient header',
    variant: 'embed', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: false, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  // ── Inline ─────────────────────────────────────────────────────

  { id: 'inline', name: 'Inline', category: 'Inline',
    description: 'Single-line bar within conversation flow',
    variant: 'inline', radius: 10, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  { id: 'pill', name: 'Pill', category: 'Inline',
    description: 'Compact rounded pill, minimal footprint',
    variant: 'pill', radius: 100, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: false, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'banner', name: 'Banner', category: 'Inline',
    description: 'Full-width thin strip with CTA button',
    variant: 'banner', radius: 8, borderWidth: 1,
    showBrand: false, showTitle: true, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'divider', name: 'Divider', category: 'Inline',
    description: 'Sits between messages as a branded divider',
    variant: 'divider', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'toolbar', name: 'Toolbar', category: 'Inline',
    description: 'Floating bar with shadow, icon, text, and CTA',
    variant: 'toolbar', radius: 12, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  // ── Native ─────────────────────────────────────────────────────

  { id: 'native', name: 'Native', category: 'Native',
    description: 'Content-first block blending with AI responses',
    variant: 'native', radius: 14, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  { id: 'suggestion', name: 'Suggestion', category: 'Native',
    description: 'Styled as a suggested follow-up action',
    variant: 'suggestion', radius: 100, borderWidth: 1,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'bubble', name: 'Bubble', category: 'Native',
    description: 'Looks like a chat message from the brand',
    variant: 'bubble', radius: 16, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  { id: 'footnote', name: 'Footnote', category: 'Native',
    description: 'Appears as a citation at the end of a response',
    variant: 'footnote', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'sponsored',
    light: E, dark: E },

  { id: 'quote', name: 'Quote', category: 'Native',
    description: 'Styled like a blockquote recommendation',
    variant: 'quote', radius: 10, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'tooltip', name: 'Tooltip', category: 'Inline',
    description: 'Small popover with pointer arrow',
    variant: 'tooltip', radius: 12, borderWidth: 1,
    showBrand: true, showTitle: false, showCta: true, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'minimal', name: 'Minimal', category: 'Native',
    description: 'Borderless text block with inline link CTA',
    variant: 'minimal', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: true, showCta: true, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },

  { id: 'hyperlink', name: 'Hyperlink', category: 'Inline',
    description: 'Inline text link with ad label — blends into paragraphs',
    variant: 'hyperlink', radius: 0, borderWidth: 0,
    showBrand: false, showTitle: false, showCta: false, showLabel: true, labelText: 'ad',
    light: E, dark: E },

  { id: 'text-link', name: 'Text Link', category: 'Inline',
    description: 'Branded inline link with favicon, name, badge, and ad copy',
    variant: 'text-link', radius: 0, borderWidth: 0,
    showBrand: true, showTitle: false, showCta: false, showLabel: true, labelText: 'Sponsored',
    light: E, dark: E },
];

const CATEGORIES = ['Cards', 'Inline', 'Native'] as const;

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
    base.cta = { style: { background: 'rgba(255,255,255,0.08)', color: '#FAFAFA' } };
  }

  if (variant === 'notification') {
    base.container = { style: { ...base.container!.style, background: '#27272A', borderColor: 'transparent', boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' } };
  }

  if (variant === 'toolbar') {
    base.container = { style: { ...base.container!.style, background: '#27272A', borderColor: 'transparent', boxShadow: '0 2px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' } };
    base.cta = { style: { background: 'rgba(255,255,255,0.1)', color: '#FAFAFA' } };
  }

  if (variant === 'bubble') {
    base.container = { style: { ...base.container!.style, background: 'transparent', borderColor: 'transparent', boxShadow: 'none' } };
    base.inner = { style: { background: 'rgba(255,255,255,0.06)' } };
    base.brand = { style: { color: 'rgba(255,255,255,0.5)' } };
    base.label = { style: { color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', borderColor: 'transparent' } };
  }

  if (variant === 'card' || variant === 'inline' || variant === 'minimal') {
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

function buildCustomSlotProps(p: { bg: string; fg: string; muted: string; borderColor: string; cta: string; ctaFg: string }): GravityAdSlotProps | undefined {
  if (!p.bg && !p.fg && !p.muted && !p.borderColor && !p.cta && !p.ctaFg) return undefined;
  return {
    ...(p.bg || p.borderColor ? { container: { style: { ...(p.bg ? { background: p.bg } : {}), ...(p.borderColor ? { borderColor: p.borderColor } : {}) } } } : {}),
    ...(p.fg ? { brand: { style: { color: p.fg } }, title: { style: { color: p.fg } } } : {}),
    ...(p.muted ? { text: { style: { color: p.muted } }, label: { style: { color: p.muted, ...(p.borderColor ? { borderColor: p.borderColor } : {}) } } } : {}),
    ...(p.cta || p.ctaFg ? { cta: { style: { ...(p.cta ? { background: p.cta } : {}), ...(p.ctaFg ? { color: p.ctaFg } : {}) } } } : {}),
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
      const isTransparentVariant = ['minimal', 'footnote', 'divider', 'native', 'quote', 'hyperlink', 'text-link'].includes(v);
      const isSolidBg = ['tooltip', 'toolbar', 'notification'].includes(v);
      const isBubble = v === 'bubble';
      const isButtonCta = ['card', 'inline', 'minimal'].includes(v);

      if (isBubble) {
        l.push(`    container: { style: { background: 'transparent', border: 'none', boxShadow: 'none' } },`);
        l.push(`    inner: { style: { background: 'rgba(255,255,255,0.06)' } },`);
      } else if (isSolidBg) {
        l.push(`    container: { style: { background: '#27272A', boxShadow: '0 2px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' } },`);
      } else if (isTransparentVariant) {
        l.push(`    container: { style: { background: 'transparent', borderColor: 'transparent' } },`);
      } else {
        l.push(`    container: { style: { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' } },`);
      }
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
      if (isButtonCta) {
        l.push(`    cta: { style: { background: '#3B82F6', color: '#FFFFFF' } },`);
      } else if (isSolidBg) {
        l.push(`    cta: { style: { background: 'rgba(255,255,255,0.1)', color: '#FAFAFA' } },`);
      } else if (v === 'banner') {
        l.push(`    cta: { style: { background: '#FAFAFA', color: '#18181B' } },`);
      } else {
        l.push(`    cta: { style: { color: '#A5B4FC' } },`);
      }
      if (v === 'accent') l.push(`    accentBar: { style: { background: '#818CF8' } },`);
      if (v === 'tooltip') l.push(`    arrow: { style: { background: '#27272A', borderColor: 'rgba(255,255,255,0.1)' } },`);
    } else {
      if (p.bg) l.push(`    container: { style: { background: '${p.bg}'${p.borderColor ? `, borderColor: '${p.borderColor}'` : ''} } },`);
      else if (p.borderColor) l.push(`    container: { style: { borderColor: '${p.borderColor}' } },`);
      if (p.fg) l.push(`    brand: { style: { color: '${p.fg}' } },`);
      if (p.fg) l.push(`    title: { style: { color: '${p.fg}' } },`);
      if (p.muted) l.push(`    text: { style: { color: '${p.muted}' } },`);
      if (p.muted) l.push(`    label: { style: { color: '${p.muted}'${p.borderColor ? `, borderColor: '${p.borderColor}'` : ''} } },`);
      if (p.cta || p.ctaFg) {
        const cp: string[] = [];
        if (p.cta) cp.push(`background: '${p.cta}'`);
        if (p.ctaFg) cp.push(`color: '${p.ctaFg}'`);
        l.push(`    cta: { style: { ${cp.join(', ')} } },`);
      }
    }
    if (hasAccent) {
      if (v === 'accent') l.push(`    accentBar: { style: { background: '${p.accentColor}' } },`);
      else if (v === 'quote' || v === 'native') l.push(`    container: { style: { borderLeftColor: '${p.accentColor}' } },`);
      else l.push(`    iconWrapper: { style: { background: '${p.accentColor}' } },`);
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

// ── Mode-aware swatch sets ───────────────────────────────────────
const SWATCHES = {
  bg:     { light: ['#FFFFFF','#F4F4F5','#F0FDF4','#0F172A','#1e1b4b'], dark: ['#18181B','#09090B','#0F172A','#052E16','#1e1b4b'] },
  fg:     { light: ['#18181B','#000000','#14532D','#0F172A','#71717A'], dark: ['#FAFAFA','#E2E8F0','#DCFCE7','#e0e7ff','#A1A1AA'] },
  muted:  { light: ['#71717A','#52525B','#18181B','#94A3B8','#444444'], dark: ['#A1A1AA','#D4D4D8','#FAFAFA','#94A3B8','#71717A'] },
  cta:    { light: ['#2563EB','#16A34A','#7c3aed','#DC2626','#18181B'], dark: ['#2563EB','#38BDF8','#16A34A','#7c3aed','#DC2626'] },
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
    borderColor: active ? 'var(--accent)' : 'var(--border)',
    background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
  }),
  seg: (active: boolean): CSSProperties => ({
    padding: '5px 12px', fontSize: 12, fontWeight: 500, borderRadius: 5,
    border: 'none', cursor: 'pointer', transition: 'all 100ms', fontFamily: 'inherit',
    background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
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
    border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
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
  catPill: (active: boolean): CSSProperties => ({
    padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#FFFFFF' : 'var(--muted)',
    transition: 'all 100ms',
  }),
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

function ChatContext({ children, mode, variant, adBody }: { children: ReactNode; mode: 'light' | 'dark'; variant: GravityAdVariant; adBody: string }) {
  const isCompact = ['pill', 'toolbar', 'divider', 'banner'].includes(variant);
  const isHyperlink = variant === 'hyperlink' || variant === 'text-link';

  const msgStyle = (isUser: boolean): CSSProperties => ({
    fontSize: 13.5, lineHeight: 1.6, color: 'var(--fg)',
    ...(isUser ? {
      background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      borderRadius: '16px 4px 16px 16px',
      padding: '12px 16px',
      maxWidth: '85%',
    } : {}),
  });

  const labelStyle: CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--muted)',
    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
  };

  const dotStyle: CSSProperties = {
    width: 6, height: 6, borderRadius: 3,
    background: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ ...labelStyle, alignSelf: 'flex-end' }}><div style={dotStyle} /> You</div>
        <div style={msgStyle(true)}>
          What tools can help me monetize my AI chatbot without ruining the user experience?
        </div>
      </div>

      <div>
        <div style={labelStyle}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Assistant
        </div>
        <div style={msgStyle(false)}>
          <p style={{ margin: '0 0 12px' }}>There are a few approaches that work well for AI platforms looking to generate revenue without disrupting conversations:</p>
          <p style={{ margin: (isCompact || isHyperlink) ? 0 : '0 0 12px' }}><strong>Contextual native ads</strong> are the most popular option — they analyze the conversation topic and serve relevant brand placements that feel like natural recommendations rather than interruptions.</p>
          {isCompact && (
            <p style={{
              margin: '12px 0 0', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
              color: mode === 'dark' ? '#93C5FD' : '#2563EB',
              textDecorationColor: mode === 'dark' ? 'rgba(147,197,253,0.3)' : 'rgba(37,99,235,0.3)',
            }}>{adBody}</p>
          )}
          {isHyperlink && (
            <p style={{ margin: '12px 0 0' }}>
              For example, platforms like {children} make this seamless by matching ads to conversation context.
            </p>
          )}
        </div>
      </div>

      {!isHyperlink && (
        <div style={{ padding: '0' }}>
          {children}
        </div>
      )}

    </div>
  );
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
      color: copied ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit',
      transition: 'all 150ms',
    }}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}


// ── App ──────────────────────────────────────────────────────────
function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  // Ad content
  const [adNull, setAdNull] = useState(false);
  const [brandName, setBrandName] = useState('Gravity');
  const [adTitle, setAdTitle] = useState('AI-Native Advertising');
  const [adBody, setAdBody] = useState('Monetize your AI platform with contextual ads that feel native to the conversation.');
  const [ctaText, setCtaText] = useState('Learn More');
  const [faviconUrl, setFaviconUrl] = useState('https://www.trygravity.ai/favicon.png');
  const fileRef = useRef<HTMLInputElement>(null);

  // Template & layout
  const [template, setTemplate] = useState(0);
  const [variant, setVariant] = useState<GravityAdVariant>('card');
  const [radius, setRadius] = useState(10);
  const [borderWidth, setBorderWidth] = useState(1);

  // Content visibility
  const [showBrand, setShowBrand] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showCta, setShowCta] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const [labelText, setLabelText] = useState('Sponsored');

  // Colors
  const [bg, setBg] = useState('');
  const [fg, setFg] = useState('');
  const [muted, setMuted] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [cta, setCta] = useState('');
  const [ctaFg, setCtaFg] = useState('');
  const [shadow, setShadow] = useState('');
  const [accentColor, setAccentColor] = useState('');

  // Preview
  const [previewMode, setPreviewMode] = useState<'isolated' | 'context'>('context');
  const [previewWidth, setPreviewWidth] = useState<'full' | 'mobile'>('full');

  // Category filter
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.body.setAttribute('data-mode', mode);
  }, [mode]);

  const applyTemplate = (i: number, m: 'light' | 'dark' = mode) => {
    const t = TEMPLATES[i];
    const c = m === 'dark' ? t.dark : t.light;
    setTemplate(i); setAdNull(false);
    setVariant(t.variant); setRadius(t.radius); setBorderWidth(t.borderWidth);
    setShowBrand(t.showBrand); setShowTitle(t.showTitle);
    setShowCta(t.showCta); setShowLabel(t.showLabel); setLabelText(t.labelText);
    setBg(c.bg); setFg(c.fg); setMuted(c.muted); setBorderColor(c.border);
    setCta(c.cta); setCtaFg(c.ctaFg); setShadow(c.shadow); setAccentColor('');
  };

  const switchMode = (m: 'light' | 'dark') => {
    setMode(m);
    const c = m === 'dark' ? TEMPLATES[template].dark : TEMPLATES[template].light;
    setBg(c.bg); setFg(c.fg); setMuted(c.muted); setBorderColor(c.border);
    setCta(c.cta); setCtaFg(c.ctaFg); setShadow(c.shadow);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFaviconUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Build ad
  const ad: AdResponse | null = adNull ? null : {
    brandName: showBrand ? brandName : undefined,
    title: showTitle ? adTitle : undefined,
    adText: adBody,
    cta: showCta ? ctaText : undefined,
    url: 'https://example.com',
    favicon: faviconUrl || undefined,
    clickUrl: 'https://example.com', impUrl: '',
  };

  const customSlots = buildCustomSlotProps({ bg, fg, muted, borderColor, cta, ctaFg });
  const hasCustomColors = !!(bg || fg || muted || borderColor || cta || ctaFg);
  const baseSlots = mode === 'dark' && !hasCustomColors ? darkAdSlots(variant) : undefined;
  const slotProps = mergeSlotProps(baseSlots, customSlots);

  const currentTemplate = TEMPLATES[template];
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

  const code = buildCode(mode, variant, showLabel, labelText, showBrand, showTitle, showCta, { bg, fg, muted, cta, ctaFg, borderColor, borderWidth, shadow, radius, accentColor, extraStyle: currentTemplate.extraStyle });
  const fullCode = `import { GravityAd } from '@gravity-ai/react';\n\n${code}`;

  const filteredTemplates = activeCategory
    ? TEMPLATES.filter(t => t.category === activeCategory)
    : TEMPLATES;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '12px 0',
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, transition: 'background 200ms, border-color 200ms',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/Gravity lockup black on white libre baskerville.png"
            alt="Gravity"
            style={{
              height: 18,
              filter: mode === 'light' ? 'invert(1)' : 'none',
              transition: 'filter 250ms ease',
            }}
          />
          <span style={{ color: 'var(--border-strong, var(--border))', margin: '0 2px', fontWeight: 300 }}>/</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>React SDK Playground</span>
        </div>
        <Seg options={['Light', 'Dark']} value={mode === 'light' ? 'Light' : 'Dark'} onChange={v => switchMode(v === 'Light' ? 'light' : 'dark')} />
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Preview controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Seg options={['In context', 'Isolated']} value={previewMode === 'context' ? 'In context' : 'Isolated'} onChange={v => setPreviewMode(v === 'In context' ? 'context' : 'isolated')} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(['mobile', 'full'] as const).map(w => (
              <button key={w} onClick={() => setPreviewWidth(w)} style={{
                ...S.seg(previewWidth === w),
                padding: '4px 8px', fontSize: 11,
              }}>
                {w === 'mobile' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{
          backgroundColor: 'var(--subtle)', borderRadius: 8,
          padding: previewMode === 'context' ? '28px 24px' : 24,
          minHeight: 180, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background-color 200ms, padding 200ms',
        }}>
          <div style={{
            width: '100%',
            maxWidth: previewWidth === 'mobile' ? 375 : 672,
            transition: 'max-width 300ms ease',
          }}>
            <FadeIn id={`${currentTemplate.id}-${previewMode}`}>
              {previewMode === 'context' ? (
                <ChatContext mode={mode} variant={variant} adBody={adBody}>
                  <GravityAd
                    ad={ad} variant={variant} showLabel={showLabel} labelText={labelText || undefined}
                    slotProps={finalSlotProps} style={containerStyle} disableImpressionTracking
                    fallback={<div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 6, fontSize: 12 }}>
                      ad is null — fallback renders here
                    </div>}
                  />
                </ChatContext>
              ) : (
                <GravityAd
                  ad={ad} variant={variant} showLabel={showLabel} labelText={labelText || undefined}
                  slotProps={finalSlotProps} style={containerStyle} disableImpressionTracking
                  fallback={<div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: 6, fontSize: 12 }}>
                    ad is null — fallback renders here
                  </div>}
                />
              )}
            </FadeIn>
          </div>
        </div>

        {/* Active template description */}
        {!adNull && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '0 4px',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', transition: 'color 200ms' }}>
              {currentTemplate.name}
            </span>
            <span style={{ fontSize: 12, color: 'var(--border)', transition: 'color 200ms' }}>—</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', transition: 'color 200ms' }}>
              {currentTemplate.description}
            </span>
          </div>
        )}

        {/* Templates with category filter */}
        <Panel title="Templates">
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            <button onClick={() => setActiveCategory(null)} style={S.catPill(activeCategory === null)}>
              All <span style={{ marginLeft: 3, opacity: 0.5, fontSize: 11 }}>{TEMPLATES.length}</span>
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={S.catPill(activeCategory === cat)}>
                {cat} <span style={{ marginLeft: 3, opacity: 0.5, fontSize: 11 }}>{TEMPLATES.filter(t => t.category === cat).length}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {filteredTemplates.map((t) => {
              const idx = TEMPLATES.indexOf(t);
              return (
                <button key={t.id} onClick={() => applyTemplate(idx)} title={t.description} style={S.pill(!adNull && template === idx)}>
                  {t.name}
                </button>
              );
            })}
            <button onClick={() => setAdNull(true)} style={S.pill(adNull)}>None</button>
          </div>
        </Panel>

        {/* Ad Content */}
        {!adNull && (
          <Panel title="Ad Content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={S.grid(2)}>
                <div>
                  <div style={S.fieldLabel}>Brand name</div>
                  <input value={brandName} onChange={e => setBrandName(e.target.value)} style={S.input} placeholder="Brand" />
                </div>
                <div>
                  <div style={S.fieldLabel}>Headline</div>
                  <input value={adTitle} onChange={e => setAdTitle(e.target.value)} style={S.input} placeholder="Headline" />
                </div>
              </div>
              <div>
                <div style={S.fieldLabel}>Body text</div>
                <input value={adBody} onChange={e => setAdBody(e.target.value)} style={S.input} placeholder="Ad body text" />
              </div>
              <div style={S.grid(3)}>
                <div>
                  <div style={S.fieldLabel}>CTA text</div>
                  <input value={ctaText} onChange={e => setCtaText(e.target.value)} style={S.input} placeholder="Learn More" />
                </div>
                <div>
                  <div style={S.fieldLabel}>Label text</div>
                  <input value={labelText} onChange={e => setLabelText(e.target.value)} style={S.input} placeholder="Sponsored" />
                </div>
                <div>
                  <div style={S.fieldLabel}>Click URL</div>
                  <input value="https://example.com" disabled style={{ ...S.input, opacity: 0.5 }} />
                </div>
              </div>
              <div>
                <div style={S.fieldLabel}>Favicon</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {faviconUrl && (
                    <img src={faviconUrl} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'contain', flexShrink: 0 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  <input value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)}
                    style={{ ...S.input, flex: 1 }} placeholder="https://example.com/favicon.png" />
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFaviconUpload} style={{ display: 'none' }} />
                  <button onClick={() => fileRef.current?.click()} style={{ ...S.pill(false), flexShrink: 0 }}>Upload</button>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Customize */}
        <Panel title="Customize">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={S.fieldLabel}>Content</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => setShowBrand(!showBrand)} style={S.pill(showBrand)}>Brand</button>
                <button onClick={() => setShowTitle(!showTitle)} style={S.pill(showTitle)}>Headline</button>
                <button onClick={() => setShowCta(!showCta)} style={S.pill(showCta)}>CTA</button>
                <button onClick={() => setShowLabel(!showLabel)} style={S.pill(showLabel)}>Label</button>
              </div>
            </div>
            <div style={S.sep} />
            <div style={S.grid(2)}>
              <div><div style={S.fieldLabel}>Radius — {radius}px</div><input type="range" min={0} max={24} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: '100%' }} /></div>
              <div><div style={S.fieldLabel}>Border width — {borderWidth}px</div><input type="range" min={0} max={4} step={0.5} value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} style={{ width: '100%' }} /></div>
            </div>
            <div style={S.sep} />
            <div style={S.grid(2)}>
              <ColorPicker label="Heading" value={fg} onChange={setFg} swatches={SWATCHES.fg[mode]} />
              <ColorPicker label="Body" value={muted} onChange={setMuted} swatches={SWATCHES.muted[mode]} />
            </div>
            <div style={S.grid(2)}>
              <ColorPicker label="Background" value={bg} onChange={setBg} swatches={SWATCHES.bg[mode]} />
              <ColorPicker label="CTA" value={cta} onChange={setCta} swatches={SWATCHES.cta[mode]} />
            </div>
            <div style={S.grid(2)}>
              <ColorPicker label="Border" value={borderColor} onChange={setBorderColor} swatches={SWATCHES.border[mode]} />
              {['accent', 'quote', 'native', 'suggestion', 'side-panel', 'embed', 'notification'].includes(variant) ? (
                <ColorPicker
                  label={variant === 'accent' ? 'Accent bar' : variant === 'quote' || variant === 'native' ? 'Left border' : 'Icon background'}
                  value={accentColor} onChange={setAccentColor}
                  swatches={SWATCHES.cta[mode]}
                />
              ) : <div />}
            </div>
          </div>
        </Panel>

        {/* Code */}
        <Panel title="Code">
          <div style={{ position: 'relative' }}>
            <CopyButton text={fullCode} />
            <pre style={S.code}>
              <span style={{ opacity: 0.4 }}>{"import { GravityAd } from '@gravity-ai/react';\n\n"}</span>
              {code}
            </pre>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default App;
