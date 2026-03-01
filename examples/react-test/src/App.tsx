import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { GravityAd } from '@gravity-ai/react';
import type { AdResponse, GravityAdVariant, GravityAdSlotProps } from '@gravity-ai/react';

// ── Mock ad ──────────────────────────────────────────────────────
const MOCK_AD: AdResponse = {
  brandName: 'Gravity',
  title: 'AI-Native Advertising',
  adText: 'Monetize your AI platform with contextual ads that feel native to the conversation.',
  cta: 'Learn More',
  url: 'https://trygravity.ai',
  favicon: 'https://www.trygravity.ai/favicon.png',
  clickUrl: 'https://trygravity.ai',
  impUrl: '',
};

// ── Dark mode ad defaults ────────────────────────────────────────
function darkAdSlots(variant: GravityAdVariant): GravityAdSlotProps {
  return {
    container: { style: {
      background: variant === 'minimal' ? 'transparent' : '#18181B',
      borderColor: variant === 'minimal' ? 'transparent' : '#3F3F46',
      boxShadow: variant === 'minimal' ? 'none' : '0 1px 4px rgba(0,0,0,0.3)',
    } },
    brand: { style: { color: '#FAFAFA' } },
    title: { style: { color: '#FAFAFA' } },
    text: { style: { color: '#A1A1AA' } },
    label: { style: { color: '#A1A1AA', borderColor: '#3F3F46' } },
  };
}

// ── Presets ──────────────────────────────────────────────────────
// Designed to reflect how ads actually look inside real AI platforms.
interface PresetColors { bg: string; fg: string; muted: string; border: string; cta: string; shadow: string; }
interface Preset {
  label: string;
  description: string;
  variant: GravityAdVariant;
  radius: number;
  borderWidth: number;
  light: PresetColors;
  dark: PresetColors;
  dot: string;
}

const EMPTY: PresetColors = { bg: '', fg: '', muted: '', border: '', cta: '', shadow: '' };

const PRESETS: Preset[] = [
  {
    label: 'Default', description: 'Standard Gravity look',
    variant: 'card', radius: 10, borderWidth: 1,
    light: EMPTY, dark: EMPTY,
    dot: '#3B82F6',
  },
  {
    label: 'Warm', description: 'Conversational AI feel',
    variant: 'card', radius: 12, borderWidth: 1,
    light: { bg: '#FAFAF9', fg: '#1C1917', muted: '#78716C', border: '#E7E5E4', cta: '#D97706', shadow: '' },
    dark:  { bg: '#1C1917', fg: '#FAFAF9', muted: '#A8A29E', border: '#44403C', cta: '#D97706', shadow: '0 1px 4px rgba(0,0,0,0.3)' },
    dot: '#D97706',
  },
  {
    label: 'Slate', description: 'Cool & professional',
    variant: 'card', radius: 10, borderWidth: 1,
    light: { bg: '#F8FAFC', fg: '#0F172A', muted: '#64748B', border: '#CBD5E1', cta: '#0284C7', shadow: '' },
    dark:  { bg: '#0F172A', fg: '#E2E8F0', muted: '#94A3B8', border: '#334155', cta: '#0EA5E9', shadow: '0 2px 8px rgba(0,0,0,0.35)' },
    dot: '#0EA5E9',
  },
  {
    label: 'Mono', description: 'Sharp & minimal',
    variant: 'card', radius: 8, borderWidth: 1,
    light: { bg: '#FFFFFF', fg: '#171717', muted: '#525252', border: '#E5E5E5', cta: '#171717', shadow: '0 1px 2px rgba(0,0,0,0.05)' },
    dark:  { bg: '#171717', fg: '#FAFAFA', muted: '#A3A3A3', border: '#404040', cta: '#FAFAFA', shadow: '0 1px 4px rgba(0,0,0,0.3)' },
    dot: '#A3A3A3',
  },
  {
    label: 'Inline', description: 'Horizontal layout',
    variant: 'inline', radius: 10, borderWidth: 1,
    light: EMPTY, dark: EMPTY,
    dot: '#8B5CF6',
  },
  {
    label: 'Minimal', description: 'Text-only, no chrome',
    variant: 'minimal', radius: 0, borderWidth: 0,
    light: EMPTY, dark: EMPTY,
    dot: '#71717A',
  },
];

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

function buildCustomSlotProps(p: { bg: string; fg: string; muted: string; borderColor: string; cta: string }): GravityAdSlotProps | undefined {
  if (!p.bg && !p.fg && !p.muted && !p.borderColor && !p.cta) return undefined;
  return {
    ...(p.bg || p.borderColor ? { container: { style: { ...(p.bg ? { background: p.bg } : {}), ...(p.borderColor ? { borderColor: p.borderColor } : {}) } } } : {}),
    ...(p.fg ? { brand: { style: { color: p.fg } }, title: { style: { color: p.fg } } } : {}),
    ...(p.muted ? { text: { style: { color: p.muted } }, label: { style: { color: p.muted, borderColor: p.borderColor || undefined } } } : {}),
    ...(p.cta ? { cta: { style: { background: p.cta } } } : {}),
  };
}

function buildCode(mode: 'light' | 'dark', v: GravityAdVariant, lt: string, p: { bg: string; fg: string; muted: string; cta: string; borderColor: string; borderWidth: number; shadow: string; radius: number }): string {
  const hasCustom = p.bg || p.fg || p.muted || p.cta || p.borderColor;
  const useDarkBase = mode === 'dark' && !hasCustom;
  const l: string[] = [`<GravityAd`, `  ad={ad}`];
  if (v !== 'card') l.push(`  variant="${v}"`);
  if (lt === '') l.push(`  showLabel={false}`);
  else if (lt !== 'Sponsored') l.push(`  labelText="${lt}"`);
  const styleParts: string[] = [];
  if (p.radius !== 10) styleParts.push(`borderRadius: ${p.radius}`);
  if (p.shadow) styleParts.push(`boxShadow: '${p.shadow}'`);
  if (p.borderWidth !== 1) styleParts.push(`borderWidth: ${p.borderWidth}`);
  if (styleParts.length) l.push(`  style={{ ${styleParts.join(', ')} }}`);
  if (useDarkBase || hasCustom) {
    l.push(`  slotProps={{`);
    if (useDarkBase) {
      l.push(`    container: { style: { background: '#18181B', borderColor: '#3F3F46' } },`);
      l.push(`    brand: { style: { color: '#FAFAFA' } },`);
      l.push(`    title: { style: { color: '#FAFAFA' } },`);
      l.push(`    text: { style: { color: '#A1A1AA' } },`);
      l.push(`    label: { style: { color: '#A1A1AA', borderColor: '#3F3F46' } },`);
    } else {
      if (p.bg) l.push(`    container: { style: { background: '${p.bg}'${p.borderColor ? `, borderColor: '${p.borderColor}'` : ''} } },`);
      else if (p.borderColor) l.push(`    container: { style: { borderColor: '${p.borderColor}' } },`);
      if (p.fg) l.push(`    brand: { style: { color: '${p.fg}' } },`);
      if (p.fg) l.push(`    title: { style: { color: '${p.fg}' } },`);
      if (p.muted) l.push(`    text: { style: { color: '${p.muted}' } },`);
      if (p.cta) l.push(`    cta: { style: { background: '${p.cta}' } },`);
    }
    l.push(`  }}`);
  }
  l.push(`/>`);
  return l.join('\n');
}

// ── Syntax highlighter ───────────────────────────────────────────
function highlightJSX(code: string): ReactNode[] {
  return code.split('\n').map((line, i, arr) => {
    const parts: ReactNode[] = [];
    let key = 0;
    const push = (text: string, color: string) => {
      parts.push(<span key={key++} style={{ color }}>{text}</span>);
    };

    const tokens: { start: number; end: number; color: string }[] = [];
    let m;

    const stringRe = /'[^']*'/g;
    const tagRe = /<\/?[A-Z]\w*/g;
    const attrRe = /\b(ad|variant|showLabel|labelText|style|slotProps|container|brand|title|text|label|cta|background|borderColor|color|borderRadius|boxShadow|borderWidth)\b/g;
    const braceRe = /[{}]/g;

    while ((m = stringRe.exec(line)) !== null)
      tokens.push({ start: m.index, end: m.index + m[0].length, color: '#86EFAC' });
    while ((m = tagRe.exec(line)) !== null)
      tokens.push({ start: m.index, end: m.index + m[0].length, color: '#7DD3FC' });
    while ((m = attrRe.exec(line)) !== null) {
      if (!tokens.some(t => m!.index >= t.start && m!.index < t.end))
        tokens.push({ start: m.index, end: m.index + m[0].length, color: '#C4B5FD' });
    }
    while ((m = braceRe.exec(line)) !== null) {
      if (!tokens.some(t => m!.index >= t.start && m!.index < t.end))
        tokens.push({ start: m.index, end: m.index + m[0].length, color: '#FDE68A' });
    }

    tokens.sort((a, b) => a.start - b.start);
    let last = 0;
    for (const t of tokens) {
      if (t.start > last) push(line.slice(last, t.start), 'var(--muted)');
      push(line.slice(t.start, t.end), t.color);
      last = t.end;
    }
    if (last < line.length) push(line.slice(last), 'var(--muted)');

    return <span key={i}>{parts}{i < arr.length - 1 ? '\n' : ''}</span>;
  });
}

// ── Mode-aware swatch sets ───────────────────────────────────────
const SWATCHES = {
  bg:     { light: ['#FFFFFF','#FAFAF9','#F8FAFC','#F5F3FF','#FEF2F2'], dark: ['#18181B','#1C1917','#0F172A','#1E1B4B','#171717'] },
  fg:     { light: ['#18181B','#1C1917','#0F172A','#171717','#71717A'], dark: ['#FAFAFA','#FAFAF9','#E2E8F0','#F5F5F5','#A1A1AA'] },
  cta:    { light: ['#2563EB','#D97706','#0284C7','#7C3AED','#171717'], dark: ['#3B82F6','#D97706','#0EA5E9','#8B5CF6','#FAFAFA'] },
  border: { light: ['#E4E4E7','#E7E5E4','#CBD5E1','#E5E5E5','transparent'], dark: ['#3F3F46','#44403C','#334155','#404040','transparent'] },
};

// ── Styles ───────────────────────────────────────────────────────
const S = {
  card: (): CSSProperties => ({
    background: 'var(--panel-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--panel-border)',
    borderRadius: 12,
    boxShadow: 'var(--panel-shadow)',
    overflow: 'hidden',
    transition: 'background 250ms, border-color 250ms, box-shadow 250ms',
  }),
  cardInner: { padding: '16px 20px' } as CSSProperties,
  sectionLabel: {
    fontSize: 10, fontWeight: 600, color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
    opacity: 0.7,
  } as CSSProperties,
  pill: (active: boolean): CSSProperties => ({
    padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8,
    border: '1px solid', cursor: 'pointer',
    transition: 'all 150ms ease', fontFamily: 'inherit',
    borderColor: active ? 'var(--active-border)' : 'var(--border)',
    background: active ? 'var(--active-bg)' : 'transparent',
    color: active ? 'var(--active-fg)' : 'var(--muted)',
  }),
  seg: (active: boolean): CSSProperties => ({
    padding: '5px 14px', fontSize: 12, fontWeight: 600, borderRadius: 6,
    border: 'none', cursor: 'pointer', transition: 'all 150ms ease', fontFamily: 'inherit',
    background: active ? 'var(--active-bg)' : 'transparent',
    color: active ? 'var(--active-fg)' : 'var(--muted)',
  }),
  segGroup: {
    display: 'inline-flex', gap: 2, background: 'var(--subtle)',
    borderRadius: 8, padding: 2, transition: 'background 250ms',
    border: '1px solid var(--border)',
  } as CSSProperties,
  fieldLabel: { fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 } as CSSProperties,
  input: {
    width: '100%', padding: '7px 10px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--subtle)',
    color: 'var(--fg)', fontSize: 12, outline: 'none', fontFamily: 'inherit',
    transition: 'all 200ms ease',
  } as CSSProperties,
  swatch: (c: string, active: boolean): CSSProperties => ({
    width: 20, height: 20, borderRadius: 5, background: c === 'transparent' ? undefined : c, cursor: 'pointer',
    border: `2px solid ${active ? 'var(--active-border)' : 'var(--border)'}`,
    transition: 'border-color 120ms, transform 120ms', flexShrink: 0,
    ...(active ? { transform: 'scale(1.1)' } : {}),
    ...(c === 'transparent' ? {
      backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
      backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
    } : {}),
  }),
  grid: (cols: number): CSSProperties => ({
    display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16,
  }),
  sep: { height: 1, background: 'var(--border)', margin: '4px 0', transition: 'background 250ms' } as CSSProperties,
  code: {
    fontSize: 12, lineHeight: 1.7, color: 'var(--muted)',
    fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
    background: 'var(--code-bg)', borderRadius: 10,
    padding: '14px 16px', overflow: 'auto', whiteSpace: 'pre', margin: 0,
    transition: 'background 250ms, color 250ms',
    border: '1px solid var(--code-border)',
  } as CSSProperties,
};

// ── Icons ────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── UI primitives ────────────────────────────────────────────────
function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div style={S.card()} className={className}>
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
        {swatches.map(c => <div key={c} onClick={() => onChange(c)} style={S.swatch(c, value === c)} />)}
        <label style={{ position: 'relative', width: 20, height: 20, cursor: 'pointer', flexShrink: 0 }}>
          <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)}
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      position: 'absolute', top: 8, right: 8,
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', fontSize: 11, fontWeight: 600,
      fontFamily: 'inherit', borderRadius: 6,
      border: '1px solid var(--border)',
      background: 'var(--surface)', color: copied ? '#16A34A' : 'var(--muted)',
      cursor: 'pointer', transition: 'all 180ms ease',
    }}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── App ──────────────────────────────────────────────────────────
function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [ad, setAd] = useState<AdResponse | null>(MOCK_AD);
  const [preset, setPreset] = useState(0);
  const [labelText, setLabelText] = useState('Sponsored');
  const [variant, setVariant] = useState<GravityAdVariant>('card');
  const [bg, setBg] = useState('');
  const [fg, setFg] = useState('');
  const [muted, setMuted] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [borderWidth, setBorderWidth] = useState(1);
  const [cta, setCta] = useState('');
  const [shadow, setShadow] = useState('');
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.body.setAttribute('data-mode', mode);
  }, [mode]);

  const applyPreset = (i: number, m: 'light' | 'dark' = mode) => {
    const p = PRESETS[i];
    const c = m === 'dark' ? p.dark : p.light;
    setPreset(i); setVariant(p.variant); setRadius(p.radius); setBorderWidth(p.borderWidth);
    setBg(c.bg); setFg(c.fg); setMuted(c.muted); setBorderColor(c.border);
    setCta(c.cta); setShadow(c.shadow);
  };

  const switchMode = (m: 'light' | 'dark') => {
    setMode(m);
    applyPreset(preset, m);
  };

  const showLabel = labelText !== '';
  const customSlots = buildCustomSlotProps({ bg, fg, muted, borderColor, cta });
  const hasCustomColors = !!(bg || fg || muted || borderColor || cta);
  const baseSlots = mode === 'dark' && !hasCustomColors ? darkAdSlots(variant) : undefined;
  const slotProps = mergeSlotProps(baseSlots, customSlots);

  const containerStyle: CSSProperties = {
    ...(radius !== 10 ? { borderRadius: radius } : {}),
    ...(shadow ? { boxShadow: shadow } : {}),
    ...(borderWidth !== 1 ? { borderWidth } : {}),
  };

  const rawCode = buildCode(mode, variant, labelText, { bg, fg, muted, cta, borderColor, borderWidth, shadow, radius });
  const fullCode = `import { GravityAd } from '@gravity-ai/react';\n\n${rawCode}`;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '12px 0',
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, transition: 'background 250ms, border-color 250ms',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/Gravity lockup white on black libre baskerville.png"
            alt="Gravity"
            style={{
              height: 18,
              filter: mode === 'light' ? 'invert(1)' : 'none',
              transition: 'filter 250ms ease',
            }}
          />
          <span style={{ color: 'var(--border-strong)', fontWeight: 300 }}>/</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>React SDK Playground</span>
        </div>
        <button
          onClick={() => switchMode(mode === 'dark' ? 'light' : 'dark')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--subtle)', color: 'var(--muted)',
            cursor: 'pointer', transition: 'all 180ms ease', fontFamily: 'inherit',
          }}
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Preview */}
        <div className="preview-grid" style={{
          background: 'var(--preview-bg)', borderRadius: 12,
          padding: variant === 'minimal' ? '28px 32px' : 28,
          transition: 'background 250ms',
          border: '1px solid var(--panel-border)',
        }}>
          <GravityAd
            ad={ad} variant={variant} showLabel={showLabel} labelText={labelText || undefined}
            slotProps={slotProps} style={containerStyle} disableImpressionTracking
            fallback={<div style={{
              padding: 20, textAlign: 'center', color: 'var(--muted)',
              border: '1px dashed var(--border)', borderRadius: 8,
              fontSize: 12, fontWeight: 500,
            }}>
              ad is null — fallback renders here
            </div>}
          />
        </div>

        {/* Presets */}
        <Panel title="Presets" className="fade-in">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => applyPreset(i)} style={{
                ...S.pill(preset === i),
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', background: p.dot, flexShrink: 0,
                        opacity: preset === i ? 1 : 0.55,
                        transition: 'opacity 180ms',
                      }} />
                {p.label}
              </button>
            ))}
          </div>
        </Panel>

        {/* Customize */}
        <Panel title="Customize" className="fade-in fade-in-1">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={S.grid(3)}>
              <div><div style={S.fieldLabel}>Variant</div><Seg options={['card','inline','minimal']} value={variant} onChange={v => setVariant(v as GravityAdVariant)} /></div>
              <div><div style={S.fieldLabel}>Ad data</div><Seg options={['Sample','null']} value={ad ? 'Sample' : 'null'} onChange={v => setAd(v === 'null' ? null : MOCK_AD)} /></div>
              <div><div style={S.fieldLabel}>Label text <span style={{ opacity: 0.5, fontWeight: 400 }}>(empty = hidden)</span></div><input value={labelText} onChange={e => setLabelText(e.target.value)} style={S.input} placeholder="Sponsored" /></div>
            </div>
            <div style={S.grid(3)}>
              <div><div style={S.fieldLabel}>Radius <span style={{ fontFamily: '"JetBrains Mono", monospace', opacity: 0.6 }}>{radius}px</span></div><input type="range" min={0} max={24} value={radius} onChange={e => setRadius(Number(e.target.value))} /></div>
              <div><div style={S.fieldLabel}>Border <span style={{ fontFamily: '"JetBrains Mono", monospace', opacity: 0.6 }}>{borderWidth}px</span></div><input type="range" min={0} max={4} value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} /></div>
              <div />
            </div>
            <div style={S.sep} />
            <div style={S.grid(2)}>
              <ColorPicker label="Background" value={bg} onChange={setBg} swatches={SWATCHES.bg[mode]} />
              <ColorPicker label="Text" value={fg} onChange={setFg} swatches={SWATCHES.fg[mode]} />
            </div>
            <div style={S.grid(2)}>
              <ColorPicker label="CTA" value={cta} onChange={setCta} swatches={SWATCHES.cta[mode]} />
              <ColorPicker label="Border" value={borderColor} onChange={setBorderColor} swatches={SWATCHES.border[mode]} />
            </div>
          </div>
        </Panel>

        {/* Code */}
        <Panel title="Code" className="fade-in fade-in-2">
          <div style={{ position: 'relative' }}>
            <pre style={S.code}>
              <span style={{ opacity: 0.35 }}>{"import { GravityAd } from '@gravity-ai/react';\n\n"}</span>
              {highlightJSX(rawCode)}
            </pre>
            <CopyButton text={fullCode} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default App;
