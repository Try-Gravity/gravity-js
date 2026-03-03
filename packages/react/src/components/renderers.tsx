import React from 'react';
import type { GravityAdSlotProps } from '../types';
import type { AdResponse, GravityAdVariant } from '../types';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface VariantRenderProps {
  ad: AdResponse;
  variant: GravityAdVariant;
  slotProps?: GravityAdSlotProps;
  showLabel: boolean;
  labelText: string;
  hovered: boolean;
  setHovered: (h: boolean) => void;
  containerRef: React.RefObject<HTMLElement | null>;
  handleClick: (e: React.MouseEvent) => void;
  linkProps: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const FONT =
  'Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';

function m(base: React.CSSProperties, ...ov: (React.CSSProperties | undefined)[]): React.CSSProperties {
  let r = base;
  for (const o of ov) if (o) r = { ...r, ...o };
  return r;
}

type Slot = keyof GravityAdSlotProps;

function ss(slot: Slot, base: React.CSSProperties, sp?: GravityAdSlotProps, extra?: React.CSSProperties): React.CSSProperties {
  return m(base, sp?.[slot]?.style, extra);
}

function sc(slot: Slot, sp?: GravityAdSlotProps): string | undefined {
  return sp?.[slot]?.className;
}

// ---------------------------------------------------------------------------
// Shared SVG icons
// ---------------------------------------------------------------------------

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowUpRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.3 }}>
    <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Shared link wrapper
// ---------------------------------------------------------------------------

function WrapLink({
  p,
  containerStyle,
  hoverStyle,
  children,
}: {
  p: VariantRenderProps;
  containerStyle: React.CSSProperties;
  hoverStyle?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const style = m(containerStyle, p.hovered && hoverStyle ? hoverStyle : undefined, p.style);
  return (
    <a
      {...(p.linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      ref={p.containerRef as React.Ref<HTMLAnchorElement>}
      className={p.className}
      style={style}
      onClick={p.handleClick}
      onMouseEnter={() => p.setHovered(true)}
      onMouseLeave={() => p.setHovered(false)}
      data-gravity-ad
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Base default styles
// ---------------------------------------------------------------------------

const D = {
  container: {
    display: 'flex', flexDirection: 'column', gap: 0, padding: 0,
    background: '#FFFFFF', color: '#18181B',
    border: '1px solid #E4E4E7', borderRadius: 10,
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.04),0 1px 6px 0 rgba(0,0,0,0.06)',
    fontFamily: FONT, textDecoration: 'none', cursor: 'pointer',
    transition: 'box-shadow 150ms ease, transform 150ms ease',
    boxSizing: 'border-box', lineHeight: 1.5, position: 'relative', overflow: 'hidden',
  } as React.CSSProperties,
  containerHover: {
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)',
    transform: 'translateY(-1px)',
  } as React.CSSProperties,
  inner: { display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px 16px' } as React.CSSProperties,
  header: { display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  favicon: { width: 20, height: 20, borderRadius: 4, objectFit: 'contain', flexShrink: 0 } as React.CSSProperties,
  brand: { fontSize: 13, fontWeight: 600, color: '#18181B', lineHeight: 1 } as React.CSSProperties,
  label: {
    fontSize: 10, fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase',
    color: '#71717A', lineHeight: 1, marginLeft: 'auto', padding: '2px 6px',
    border: '1px solid #E4E4E7', borderRadius: 4,
  } as React.CSSProperties,
  body: { display: 'flex', flexDirection: 'column', gap: 6 } as React.CSSProperties,
  title: { fontSize: 14, fontWeight: 500, color: '#18181B', margin: 0, lineHeight: 1.4 } as React.CSSProperties,
  text: { fontSize: 13, color: '#71717A', margin: 0, lineHeight: 1.5 } as React.CSSProperties,
  cta: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start',
    gap: 4, padding: '7px 16px', fontSize: 13, fontWeight: 500,
    color: '#FFFFFF', background: '#2563EB', border: 'none', borderRadius: 6,
    cursor: 'pointer', transition: 'background 150ms ease', textDecoration: 'none',
    lineHeight: 1, fontFamily: 'inherit', marginTop: 2,
  } as React.CSSProperties,
};

// Shared label badge (used across many variants as an inline span instead of bordered pill)
const inlineLabel: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'rgba(0,0,0,0.3)', lineHeight: 1,
};

// Link-style CTA (used by several variants instead of a button CTA)
const linkCta: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#2563EB', textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none',
  border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
};

// ═══════════════════════════════════════════════════════════════════
// VARIANT RENDERERS
// ═══════════════════════════════════════════════════════════════════

// ── Card ─────────────────────────────────────────────────────────

export function renderCard(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText, hovered } = p;
  const containerStyle = ss('container', D.container, sp);
  const hoverExtra = hovered ? D.containerHover : undefined;

  const hasHeader = ad.favicon || ad.brandName || showLabel;

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={hoverExtra}>
      <div style={ss('inner', D.inner, sp)} className={sc('inner', sp)}>
        {hasHeader && (
          <div style={ss('header', D.header, sp)} className={sc('header', sp)}>
            {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', D.favicon, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            {ad.brandName && <span style={ss('brand', D.brand, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
            {showLabel && <span style={ss('label', D.label, sp)} className={sc('label', sp)}>{labelText}</span>}
          </div>
        )}
        <div style={ss('body', D.body, sp)} className={sc('body', sp)}>
          {ad.title && <p style={ss('title', D.title, sp)} className={sc('title', sp)}>{ad.title}</p>}
          <p style={ss('text', D.text, sp)} className={sc('text', sp)}>{ad.adText}</p>
        </div>
        {ad.cta && <span style={ss('cta', D.cta, sp)} className={sc('cta', sp)}>{ad.cta}</span>}
      </div>
    </WrapLink>
  );
}

// ── Inline ───────────────────────────────────────────────────────

export function renderInline(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText, hovered } = p;
  const containerStyle = ss('container', { ...D.container, overflow: 'visible' }, sp);

  const hasHeader = ad.favicon || ad.brandName || showLabel;

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={hovered ? D.containerHover : undefined}>
      <div style={ss('inner', { ...D.inner, flexDirection: 'row', alignItems: 'center', gap: 14, padding: '12px 16px' }, sp)} className={sc('inner', sp)}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hasHeader && (
            <div style={ss('header', D.header, sp)} className={sc('header', sp)}>
              {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', D.favicon, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              {ad.brandName && <span style={ss('brand', D.brand, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
              {showLabel && <span style={ss('label', D.label, sp)} className={sc('label', sp)}>{labelText}</span>}
            </div>
          )}
          <div style={ss('body', { ...D.body, gap: 2 }, sp)} className={sc('body', sp)}>
            {ad.title && <p style={ss('title', D.title, sp)} className={sc('title', sp)}>{ad.title}</p>}
            <p style={ss('text', D.text, sp)} className={sc('text', sp)}>{ad.adText}</p>
          </div>
        </div>
        {ad.cta && <span style={ss('cta', { ...D.cta, flexShrink: 0, marginTop: 0 }, sp)} className={sc('cta', sp)}>{ad.cta}</span>}
      </div>
    </WrapLink>
  );
}

// ── Minimal ──────────────────────────────────────────────────────

export function renderMinimal(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText, hovered } = p;
  const containerStyle = ss('container', {
    ...D.container, background: 'transparent', border: 'none',
    boxShadow: 'none', borderRadius: 0, overflow: 'visible',
  }, sp);
  const hoverExtra = hovered ? { boxShadow: 'none', transform: 'none' } as React.CSSProperties : undefined;

  const hasHeader = ad.favicon || ad.brandName || showLabel;

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={hoverExtra}>
      <div style={ss('inner', { ...D.inner, padding: '8px 0' }, sp)} className={sc('inner', sp)}>
        {hasHeader && (
          <div style={ss('header', D.header, sp)} className={sc('header', sp)}>
            {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', D.favicon, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            {ad.brandName && <span style={ss('brand', D.brand, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
            {showLabel && <span style={ss('label', D.label, sp)} className={sc('label', sp)}>{labelText}</span>}
          </div>
        )}
        <div style={ss('body', D.body, sp)} className={sc('body', sp)}>
          {ad.title && <p style={ss('title', D.title, sp)} className={sc('title', sp)}>{ad.title}</p>}
          <p style={ss('text', D.text, sp)} className={sc('text', sp)}>{ad.adText}</p>
        </div>
        {ad.cta && <span style={ss('cta', D.cta, sp)} className={sc('cta', sp)}>{ad.cta}</span>}
      </div>
    </WrapLink>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CHAT / AI-NATIVE VARIANTS
// ═══════════════════════════════════════════════════════════════════

// ── Bubble ───────────────────────────────────────────────────────

export function renderBubble(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, background: 'transparent', border: 'none', boxShadow: 'none',
    overflow: 'visible', borderRadius: 0,
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      <div style={ss('header', { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }, sp)} className={sc('header', sp)}>
        {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, borderRadius: 6 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        {ad.brandName && <span style={ss('brand', { ...D.brand, color: 'rgba(0,0,0,0.6)' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
        {showLabel && (
          <span style={ss('label', {
            fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.25)', background: 'rgba(0,0,0,0.04)',
            padding: '2px 5px', borderRadius: 3, border: 'none', lineHeight: 1,
          }, sp)} className={sc('label', sp)}>{labelText}</span>
        )}
      </div>
      <div style={ss('inner', {
        background: '#F3F3F3', borderRadius: '4px 16px 16px 16px', padding: '14px 18px',
      }, sp)} className={sc('inner', sp)}>
        {ad.title && <p style={ss('title', { ...D.title, fontWeight: 600, color: 'rgba(0,0,0,0.65)', margin: '0 0 4px' }, sp)} className={sc('title', sp)}>{ad.title}</p>}
        <p style={ss('text', { ...D.text, color: 'rgba(0,0,0,0.45)', margin: '0 0 12px' }, sp)} className={sc('text', sp)}>{ad.adText}</p>
        {ad.cta && (
          <span style={ss('cta', { ...linkCta, marginTop: 0 }, sp)} className={sc('cta', sp)}>
            {ad.cta} <ArrowUpRight />
          </span>
        )}
      </div>
    </WrapLink>
  );
}

// ── Contextual ───────────────────────────────────────────────────

export function renderContextual(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;

  const wrapperStyle: React.CSSProperties = {
    fontFamily: FONT, textDecoration: 'none', color: '#18181B', lineHeight: 1.5,
  };

  const cardStyle = ss('container', {
    background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'flex-start',
  }, sp);

  const iconWrapperStyle = ss('iconWrapper', {
    width: 40, height: 40, borderRadius: 10, background: 'rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }, sp);

  return (
    <div style={m(wrapperStyle, p.style)} className={p.className}>
      <p style={ss('contextHeader', {
        fontSize: 11, fontWeight: 500, color: 'rgba(0,0,0,0.3)', margin: '0 0 10px',
      }, sp)} className={sc('contextHeader', sp)}>Relevant to this conversation</p>
      <a
        {...(p.linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={p.containerRef as React.Ref<HTMLAnchorElement>}
        style={cardStyle}
        onClick={p.handleClick}
        onMouseEnter={() => p.setHovered(true)}
        onMouseLeave={() => p.setHovered(false)}
        data-gravity-ad
      >
        <div style={iconWrapperStyle} className={sc('iconWrapper', sp)}>
          {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', D.favicon, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={ss('header', { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }, sp)} className={sc('header', sp)}>
            {ad.title && <span style={ss('title', { fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }, sp)} className={sc('title', sp)}>{ad.title}</span>}
            {showLabel && <span style={ss('label', { ...inlineLabel, border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText}</span>}
          </div>
          <p style={ss('text', { fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 12px', lineHeight: 1.5 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
          {ad.cta && (
            <span style={ss('cta', linkCta, sp)} className={sc('cta', sp)}>
              {ad.cta} <ArrowUpRight />
            </span>
          )}
        </div>
      </a>
      <p style={ss('footer', { fontSize: 10, color: 'rgba(0,0,0,0.2)', margin: '8px 0 0', textAlign: 'right' }, sp)} className={sc('footer', sp)}>partner</p>
    </div>
  );
}

// ── Native ───────────────────────────────────────────────────────

export function renderNative(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, background: 'rgba(0,0,0,0.015)', border: 'none',
    borderLeft: '2px solid rgba(0,0,0,0.08)', borderRadius: 14,
    boxShadow: 'none', padding: '20px 24px', overflow: 'visible',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      <p style={ss('text', { fontSize: 13.5, color: 'rgba(0,0,0,0.6)', margin: '0 0 14px', lineHeight: 1.6 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
      <div style={ss('footer', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, sp)} className={sc('footer', sp)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, width: 14, height: 14, borderRadius: 3 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          {ad.brandName && <span style={ss('brand', { fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.4)' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
          {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 10, color: 'rgba(0,0,0,0.2)', border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText}</span>}
        </div>
        {ad.cta && (
          <span style={ss('cta', { ...linkCta, fontSize: 12, color: 'rgba(0,0,0,0.45)' }, sp)} className={sc('cta', sp)}>
            {ad.cta} <ArrowUpRight />
          </span>
        )}
      </div>
    </WrapLink>
  );
}

// ── Footnote ─────────────────────────────────────────────────────

export function renderFootnote(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, background: 'transparent', border: 'none',
    boxShadow: 'none', borderRadius: 0, overflow: 'visible',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 12 }} />
      <div style={ss('inner', { display: 'flex', alignItems: 'flex-start', gap: 8, padding: 0 }, sp)} className={sc('inner', sp)}>
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)', fontWeight: 600, marginTop: 1, flexShrink: 0 }}>↳</span>
        <div>
          <p style={ss('text', { fontSize: 12.5, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 1.55 }, sp)} className={sc('text', sp)}>
            {ad.brandName && <span style={ss('brand', { fontWeight: 600, color: 'rgba(0,0,0,0.55)' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
            {ad.brandName && ' — '}
            {ad.adText}{' '}
            {ad.cta && <span style={ss('cta', { ...linkCta, fontSize: 12.5, padding: 0, display: 'inline' }, sp)} className={sc('cta', sp)}>{ad.cta} ↗</span>}
          </p>
          {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 9, color: 'rgba(0,0,0,0.18)', border: 'none', padding: 0, marginLeft: 0, marginTop: 4, display: 'block' }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
        </div>
      </div>
    </WrapLink>
  );
}

// ── Quote ────────────────────────────────────────────────────────

export function renderQuote(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, background: 'rgba(0,0,0,0.01)', border: 'none',
    borderLeft: '3px solid #2563EB', borderRadius: '0 10px 10px 0',
    boxShadow: 'none', padding: '18px 22px', overflow: 'visible',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      <p style={ss('text', { fontSize: 14, color: 'rgba(0,0,0,0.6)', margin: '0 0 12px', lineHeight: 1.6, fontStyle: 'italic' }, sp)} className={sc('text', sp)}>
        &ldquo;{ad.adText}&rdquo;
      </p>
      <div style={ss('footer', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, sp)} className={sc('footer', sp)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, width: 16, height: 16 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          {ad.brandName && <span style={ss('brand', { fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
          {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 9, color: 'rgba(0,0,0,0.2)', border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
        </div>
        {ad.cta && <span style={ss('cta', { ...linkCta, fontSize: 12 }, sp)} className={sc('cta', sp)}>{ad.cta} →</span>}
      </div>
    </WrapLink>
  );
}

// ── Suggestion ───────────────────────────────────────────────────

export function renderSuggestion(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;

  const wrapperStyle: React.CSSProperties = {
    fontFamily: FONT, textDecoration: 'none', color: '#18181B', lineHeight: 1.5,
  };

  const pillStyle = ss('container', {
    display: 'inline-flex', alignItems: 'center', gap: 12,
    padding: '12px 20px 12px 14px', background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.08)', borderRadius: 100, cursor: 'pointer',
    fontFamily: FONT, textDecoration: 'none', boxSizing: 'border-box',
    transition: 'border-color 150ms ease',
  }, sp);

  const iconWrapperStyle = ss('iconWrapper', {
    width: 32, height: 32, borderRadius: 100, background: 'rgba(0,0,0,0.03)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }, sp);

  return (
    <div style={m(wrapperStyle, p.style)} className={p.className}>
      <p style={ss('contextHeader', { fontSize: 11, color: 'rgba(0,0,0,0.25)', margin: '0 0 8px', fontWeight: 500 }, sp)} className={sc('contextHeader', sp)}>
        You might also want to try
      </p>
      <a
        {...(p.linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={p.containerRef as React.Ref<HTMLAnchorElement>}
        style={pillStyle}
        onClick={p.handleClick}
        onMouseEnter={() => p.setHovered(true)}
        onMouseLeave={() => p.setHovered(false)}
        data-gravity-ad
      >
        <div style={iconWrapperStyle} className={sc('iconWrapper', sp)}>
          {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 16, height: 16, borderRadius: 4, objectFit: 'contain' }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {ad.title && <span style={ss('title', { fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }, sp)} className={sc('title', sp)}>{ad.title}</span>}
            {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 9, border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
          </div>
          <span style={ss('text', { fontSize: 12, color: 'rgba(0,0,0,0.4)', margin: 0 }, sp)} className={sc('text', sp)}>
            {ad.brandName}{ad.cta ? ` · ${ad.cta}` : ''}
          </span>
        </div>
        <ChevronRight />
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LAYOUT VARIANTS
// ═══════════════════════════════════════════════════════════════════

// ── Accent ───────────────────────────────────────────────────────

export function renderAccent(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, overflow: 'hidden',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={p.hovered ? D.containerHover : undefined}>
      <div style={ss('accentBar', { height: 3, background: '#2563EB' }, sp)} className={sc('accentBar', sp)} />
      <div style={ss('inner', { ...D.inner, padding: '18px 22px' }, sp)} className={sc('inner', sp)}>
        <div style={ss('header', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }, sp)} className={sc('header', sp)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, width: 18, height: 18 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            {ad.brandName && <span style={ss('brand', { ...D.brand, fontSize: 14 }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
          </div>
          {showLabel && <span style={ss('label', { ...inlineLabel, border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText}</span>}
        </div>
        <p style={ss('text', { ...D.text, fontSize: 14, color: 'rgba(0,0,0,0.55)', margin: '0 0 16px', lineHeight: 1.55 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
        {ad.cta && <span style={ss('cta', { ...linkCta }, sp)} className={sc('cta', sp)}>{ad.cta} <ArrowRight /></span>}
      </div>
    </WrapLink>
  );
}

// ── Side Panel ───────────────────────────────────────────────────

export function renderSidePanel(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, display: 'flex', flexDirection: 'row', alignItems: 'stretch',
    overflow: 'hidden', background: '#FAFAFA',
  }, sp);

  const iconWrapperStyle = ss('iconWrapper', {
    width: 72, background: 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, borderRight: '1px solid rgba(0,0,0,0.05)',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={p.hovered ? D.containerHover : undefined}>
      <div style={iconWrapperStyle} className={sc('iconWrapper', sp)}>
        {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, width: 28, height: 28, borderRadius: 6 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      </div>
      <div style={ss('inner', { padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }, sp)} className={sc('inner', sp)}>
        <div style={ss('header', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }, sp)} className={sc('header', sp)}>
          {ad.title && <span style={ss('title', { fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }, sp)} className={sc('title', sp)}>{ad.title}</span>}
          {showLabel && <span style={ss('label', { ...inlineLabel, border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText}</span>}
        </div>
        <p style={ss('text', { fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 10px', lineHeight: 1.5 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
        {ad.cta && <span style={ss('cta', { ...linkCta, fontSize: 12.5 }, sp)} className={sc('cta', sp)}>{ad.cta} <ArrowUpRight /></span>}
      </div>
    </WrapLink>
  );
}

// ── Labeled ──────────────────────────────────────────────────────

export function renderLabeled(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, display: 'flex', flexDirection: 'row', overflow: 'hidden', background: '#FFFFFF',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={p.hovered ? D.containerHover : undefined}>
      {showLabel && (
        <div style={ss('footer', {
          width: 36, flexShrink: 0, background: 'rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRight: '1px solid rgba(0,0,0,0.05)',
          writingMode: 'vertical-rl', textOrientation: 'mixed',
        }, sp)} className={sc('footer', sp)}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.2)', transform: 'rotate(180deg)' }}>
            {labelText}
          </span>
        </div>
      )}
      <div style={ss('inner', { padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }, sp)} className={sc('inner', sp)}>
        <div style={ss('header', { display: 'flex', alignItems: 'center', gap: 10 }, sp)} className={sc('header', sp)}>
          {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, borderRadius: 5 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          {ad.brandName && <span style={ss('brand', { ...D.brand, fontSize: 14 }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
        </div>
        {ad.title && <p style={ss('title', { fontSize: 14, fontWeight: 600, color: '#111', margin: 0, letterSpacing: '-0.01em' }, sp)} className={sc('title', sp)}>{ad.title}</p>}
        <p style={ss('text', { fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 4px', lineHeight: 1.5 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
        {ad.cta && <span style={ss('cta', { ...linkCta, fontSize: 13 }, sp)} className={sc('cta', sp)}>{ad.cta} <ArrowRight /></span>}
      </div>
    </WrapLink>
  );
}

// ── Spotlight ─────────────────────────────────────────────────────

export function renderSpotlight(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, textAlign: 'center', padding: '32px 28px', borderRadius: 16,
  }, sp);

  const iconWrapperStyle = ss('iconWrapper', {
    width: 56, height: 56, borderRadius: 16, margin: '0 auto 18px',
    background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={p.hovered ? D.containerHover : undefined}>
      <div style={iconWrapperStyle} className={sc('iconWrapper', sp)}>
        {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 28, height: 28, borderRadius: 7, objectFit: 'contain' }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      </div>
      {ad.title && <p style={ss('title', { fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.02em' }, sp)} className={sc('title', sp)}>{ad.title}</p>}
      <p style={ss('text', { fontSize: 13.5, color: 'rgba(0,0,0,0.45)', margin: '0 0 22px', lineHeight: 1.55 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
      {ad.cta && (
        <span style={ss('cta', {
          ...D.cta, background: '#1A1A1A', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'center',
        }, sp)} className={sc('cta', sp)}>
          {ad.cta} <ArrowRight />
        </span>
      )}
      {showLabel && (
        <p style={ss('label', { fontSize: 9, color: 'rgba(0,0,0,0.2)', margin: '14px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', padding: 0 }, sp)} className={sc('label', sp)}>
          {labelText.toLowerCase()}
        </p>
      )}
    </WrapLink>
  );
}

// ── Embed ────────────────────────────────────────────────────────

export function renderEmbed(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, overflow: 'hidden', borderRadius: 12,
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={p.hovered ? D.containerHover : undefined}>
      <div style={ss('iconWrapper', {
        height: 80, background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }, sp)} className={sc('iconWrapper', sp)}>
        {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 32, height: 32, borderRadius: 8, objectFit: 'contain' }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      </div>
      <div style={ss('inner', { padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }, sp)} className={sc('inner', sp)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {ad.brandName && <span style={ss('brand', { fontSize: 11, color: 'rgba(0,0,0,0.35)' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
          {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 9, border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
        </div>
        {ad.title && <p style={ss('title', { fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }, sp)} className={sc('title', sp)}>{ad.title}</p>}
        <p style={ss('text', { fontSize: 12.5, color: 'rgba(0,0,0,0.45)', margin: 0, lineHeight: 1.45 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
      </div>
    </WrapLink>
  );
}

// ── Split Action ─────────────────────────────────────────────────

export function renderSplitAction(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    ...D.container, overflow: 'hidden',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle} hoverStyle={p.hovered ? D.containerHover : undefined}>
      <div style={ss('inner', { padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }, sp)} className={sc('inner', sp)}>
        <div style={ss('header', { display: 'flex', alignItems: 'center', gap: 10 }, sp)} className={sc('header', sp)}>
          {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, width: 18, height: 18 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          {ad.brandName && <span style={ss('brand', { ...D.brand, fontSize: 14 }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
          {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 10, border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText}</span>}
        </div>
        <p style={ss('text', { fontSize: 13.5, color: 'rgba(0,0,0,0.55)', margin: 0, lineHeight: 1.55 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
      </div>
      <div style={ss('footer', {
        display: 'flex', borderTop: '1px solid rgba(0,0,0,0.05)',
      }, sp)} className={sc('footer', sp)}>
        <span style={ss('secondaryCta', {
          flex: 1, padding: 12, background: 'transparent', border: 'none',
          borderRight: '1px solid rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.45)',
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textAlign: 'center',
          fontFamily: 'inherit', textDecoration: 'none',
        }, sp)} className={sc('secondaryCta', sp)}>Learn more</span>
        {ad.cta && (
          <span style={ss('cta', {
            flex: 1, padding: 12, background: 'transparent', border: 'none',
            color: '#2563EB', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            textAlign: 'center', fontFamily: 'inherit', textDecoration: 'none',
          }, sp)} className={sc('cta', sp)}>{ad.cta} →</span>
        )}
      </div>
    </WrapLink>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COMPACT / INLINE VARIANTS
// ═══════════════════════════════════════════════════════════════════

// ── Pill ─────────────────────────────────────────────────────────

export function renderPill(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 10px',
    background: 'rgba(0,0,0,0.03)', borderRadius: 100,
    border: '1px solid rgba(0,0,0,0.06)',
    fontFamily: FONT, textDecoration: 'none', cursor: 'pointer', boxSizing: 'border-box',
    lineHeight: 1.5, transition: 'border-color 150ms ease',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 16, height: 16, borderRadius: 4, objectFit: 'contain', flexShrink: 0 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      {ad.brandName && <span style={ss('brand', { fontSize: 13, fontWeight: 600, color: '#1A1A1A' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
      <span style={{ width: 1, height: 14, background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
      {ad.title && <span style={ss('title', { fontSize: 12.5, color: 'rgba(0,0,0,0.45)', margin: 0 }, sp)} className={sc('title', sp)}>{ad.title}</span>}
      {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 10, color: 'rgba(0,0,0,0.25)', border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
    </WrapLink>
  );
}

// ── Banner ───────────────────────────────────────────────────────

export function renderBanner(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '10px 18px', background: 'rgba(0,0,0,0.015)',
    borderRadius: 8, border: '1px solid rgba(0,0,0,0.04)',
    fontFamily: FONT, textDecoration: 'none', cursor: 'pointer', boxSizing: 'border-box',
    lineHeight: 1.5, transition: 'background 150ms ease',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 16, height: 16, borderRadius: 3, objectFit: 'contain', flexShrink: 0 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        {ad.title && <span style={ss('title', { fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }, sp)} className={sc('title', sp)}>{ad.title}</span>}
        {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 10, color: 'rgba(0,0,0,0.2)', border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
      </div>
      {ad.cta && (
        <span style={ss('cta', {
          background: '#1A1A1A', color: '#FFFFFF', border: 'none', borderRadius: 6,
          padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', textDecoration: 'none', flexShrink: 0,
        }, sp)} className={sc('cta', sp)}>{ad.cta}</span>
      )}
    </WrapLink>
  );
}

// ── Divider ──────────────────────────────────────────────────────

export function renderDivider(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', width: '100%',
    background: 'transparent', border: 'none', boxShadow: 'none', borderRadius: 0,
    fontFamily: FONT, textDecoration: 'none', cursor: 'pointer', boxSizing: 'border-box',
    lineHeight: 1.5,
  }, sp);

  const lineStyle: React.CSSProperties = { flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' };

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      <div style={lineStyle} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 14, height: 14, borderRadius: 3, objectFit: 'contain' }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        {ad.brandName && <span style={ss('brand', { fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.35)' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
        {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 10, color: 'rgba(0,0,0,0.2)', border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
        <span style={{ color: 'rgba(0,0,0,0.15)' }}>·</span>
        {ad.cta && <span style={ss('cta', { ...linkCta, fontSize: 12, padding: 0, marginTop: 0 }, sp)} className={sc('cta', sp)}>{ad.cta} ↗</span>}
      </div>
      <div style={lineStyle} />
    </WrapLink>
  );
}

// ── Toolbar ──────────────────────────────────────────────────────

export function renderToolbar(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
    background: '#FFFFFF', borderRadius: 12,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
    fontFamily: FONT, textDecoration: 'none', cursor: 'pointer', boxSizing: 'border-box',
    lineHeight: 1.5, border: 'none',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { ...D.favicon, borderRadius: 5, flexShrink: 0 }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {ad.brandName && <span style={ss('brand', { fontSize: 13, fontWeight: 600, color: '#1A1A1A' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
        {ad.title && <span style={ss('title', { fontSize: 12, color: 'rgba(0,0,0,0.35)', marginLeft: 8, margin: 0 }, sp)} className={sc('title', sp)}>{ad.title}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 9, color: 'rgba(0,0,0,0.2)', border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
        {ad.cta && (
          <span style={ss('cta', {
            background: '#1A1A1A', color: '#FFFFFF', border: 'none', borderRadius: 7,
            padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap',
          }, sp)} className={sc('cta', sp)}>{ad.cta}</span>
        )}
      </div>
    </WrapLink>
  );
}

// ── Tooltip ──────────────────────────────────────────────────────

export function renderTooltip(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;

  const wrapperStyle: React.CSSProperties = {
    fontFamily: FONT, textDecoration: 'none', color: '#18181B', lineHeight: 1.5,
    position: 'relative',
  };

  const cardStyle = ss('container', {
    display: 'flex', flexDirection: 'column', gap: 10,
    background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12, padding: '16px 18px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textDecoration: 'none', cursor: 'pointer', boxSizing: 'border-box',
  }, sp);

  const arrowStyle = ss('arrow', {
    position: 'absolute', bottom: -6, left: 24,
    width: 12, height: 12, transform: 'rotate(45deg)',
    background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
    borderTop: 'none', borderLeft: 'none',
  }, sp);

  return (
    <div style={m(wrapperStyle, p.style)} className={p.className}>
      <a
        {...(p.linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={p.containerRef as React.Ref<HTMLAnchorElement>}
        style={cardStyle}
        onClick={p.handleClick}
        onMouseEnter={() => p.setHovered(true)}
        onMouseLeave={() => p.setHovered(false)}
        data-gravity-ad
      >
        <div style={ss('header', { display: 'flex', alignItems: 'center', gap: 8 }, sp)} className={sc('header', sp)}>
          {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 16, height: 16, borderRadius: 4, objectFit: 'contain' }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          {ad.brandName && <span style={ss('brand', { fontSize: 13, fontWeight: 600, color: '#1A1A1A' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
          {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 9, marginLeft: 'auto', border: 'none', padding: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()}</span>}
        </div>
        <p style={ss('text', { fontSize: 12.5, color: 'rgba(0,0,0,0.5)', margin: 0, lineHeight: 1.5 }, sp)} className={sc('text', sp)}>{ad.adText}</p>
        {ad.cta && (
          <span style={ss('cta', {
            width: '100%', background: '#F3F3F3', color: '#1A1A1A', border: 'none',
            borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            textAlign: 'center', fontFamily: 'inherit', textDecoration: 'none',
            display: 'block', boxSizing: 'border-box',
          }, sp)} className={sc('cta', sp)}>{ad.cta}</span>
        )}
      </a>
      <div style={arrowStyle} className={sc('arrow', sp)} />
    </div>
  );
}

// ── Notification ─────────────────────────────────────────────────

export function renderNotification(p: VariantRenderProps) {
  const { ad, slotProps: sp, showLabel, labelText } = p;
  const containerStyle = ss('container', {
    display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px',
    background: '#FFFFFF', borderRadius: 14,
    boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)',
    fontFamily: FONT, textDecoration: 'none', cursor: 'pointer', boxSizing: 'border-box',
    lineHeight: 1.5, border: 'none',
  }, sp);

  const iconWrapperStyle = ss('iconWrapper', {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }, sp);

  return (
    <WrapLink p={p} containerStyle={containerStyle}>
      <div style={iconWrapperStyle} className={sc('iconWrapper', sp)}>
        {ad.favicon && <img src={ad.favicon} alt="" loading="lazy" style={ss('favicon', { width: 20, height: 20, borderRadius: 5, objectFit: 'contain' }, sp)} className={sc('favicon', sp)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={ss('header', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }, sp)} className={sc('header', sp)}>
          {ad.brandName && <span style={ss('brand', { fontSize: 13, fontWeight: 700, color: '#1A1A1A' }, sp)} className={sc('brand', sp)}>{ad.brandName}</span>}
          {showLabel && <span style={ss('label', { ...inlineLabel, fontSize: 10, color: 'rgba(0,0,0,0.25)', border: 'none', padding: 0, marginLeft: 0 }, sp)} className={sc('label', sp)}>{labelText.toLowerCase()} · now</span>}
        </div>
        <p style={ss('text', { fontSize: 13, color: 'rgba(0,0,0,0.55)', margin: 0, lineHeight: 1.45 }, sp)} className={sc('text', sp)}>
          {ad.title ? `${ad.title} — ${ad.adText}` : ad.adText}
        </p>
      </div>
    </WrapLink>
  );
}

// ═══════════════════════════════════════════════════════════════════
// RENDERER MAP
// ═══════════════════════════════════════════════════════════════════

export const renderers: Record<string, (p: VariantRenderProps) => React.ReactElement> = {
  card: renderCard,
  inline: renderInline,
  minimal: renderMinimal,
  bubble: renderBubble,
  contextual: renderContextual,
  native: renderNative,
  footnote: renderFootnote,
  quote: renderQuote,
  suggestion: renderSuggestion,
  accent: renderAccent,
  'side-panel': renderSidePanel,
  labeled: renderLabeled,
  spotlight: renderSpotlight,
  embed: renderEmbed,
  'split-action': renderSplitAction,
  pill: renderPill,
  banner: renderBanner,
  divider: renderDivider,
  toolbar: renderToolbar,
  tooltip: renderTooltip,
  notification: renderNotification,
};
