# Styling `<GravityAd />`

## How it works

`<GravityAd />` uses **inline styles on every element**. There are no injected stylesheets, no CSS class names, and no CSS custom properties. Every visual value is a plain `React.CSSProperties` object that you can read, override, or replace.

## DOM structure

```
a                                ← outer link (container)
  div                            ← inner padding/layout wrapper
    div                          ← header row
      img                        ← favicon
      span                       ← brand name
      span                       ← "Sponsored" label
    div                          ← body
      p                          ← title
      p                          ← ad text
    span                         ← CTA button

Inline variant:
  a
    div                          ← inner (row layout)
      div                        ← content column
        div                      ← header
        div                      ← body
      span                       ← CTA (right-aligned)
```

## Method 1: `style` prop

Override the outer container directly:

```tsx
<GravityAd ad={ad} style={{ maxWidth: 400, borderRadius: 16 }} />
```

## Method 2: `slotProps`

Target any inner element by name:

```tsx
<GravityAd
  ad={ad}
  slotProps={{
    cta: { style: { background: '#E11D48', borderRadius: 999 } },
    label: { style: { display: 'none' } },
    inner: { style: { padding: '20px 24px' } },
  }}
/>
```

Slot keys: `container`, `inner`, `header`, `favicon`, `brand`, `label`, `body`, `title`, `text`, `cta`.

Each accepts `{ style?: CSSProperties; className?: string }`.

## Method 3: `className` prop

Add a CSS class to the outer container or any slot for external stylesheet overrides:

```tsx
<GravityAd ad={ad} className="my-ad" />

<GravityAd
  ad={ad}
  slotProps={{
    cta: { className: 'my-cta-override' },
  }}
/>
```

## Default values

Every inline style is visible in the component source. Here are the defaults for reference:

| Element | Key properties |
|---------|---------------|
| Container | `background: '#FFFFFF'`, `border: '1px solid #E4E4E7'`, `borderRadius: 10`, `boxShadow: '0 1px 2px ...'` |
| Inner | `padding: '14px 16px 16px'`, `gap: 10` |
| Brand | `fontSize: 13`, `fontWeight: 600`, `color: '#18181B'` |
| Label | `fontSize: 10`, `textTransform: 'uppercase'`, `color: '#71717A'`, `border: '1px solid #E4E4E7'` |
| Title | `fontSize: 14`, `fontWeight: 500`, `color: '#18181B'` |
| Text | `fontSize: 13`, `color: '#71717A'` |
| CTA | `background: '#2563EB'`, `color: '#FFFFFF'`, `borderRadius: 6`, `padding: '7px 16px'` |

## Common recipes

### Dark mode

```tsx
<GravityAd
  ad={ad}
  style={{
    background: '#18181B',
    color: '#FAFAFA',
    border: '1px solid #3F3F46',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  }}
  slotProps={{
    brand: { style: { color: '#FAFAFA' } },
    title: { style: { color: '#FAFAFA' } },
    text: { style: { color: '#A1A1AA' } },
    label: { style: { color: '#A1A1AA', border: '1px solid #3F3F46' } },
    cta: { style: { background: '#3B82F6' } },
  }}
/>
```

### Match your brand color

```tsx
<GravityAd
  ad={ad}
  slotProps={{
    cta: { style: { background: '#E11D48' } },
  }}
/>
```

### Pill-shaped CTA

```tsx
<GravityAd
  ad={ad}
  slotProps={{
    cta: { style: { borderRadius: 999 } },
  }}
/>
```

### Hide the label

```tsx
<GravityAd ad={ad} showLabel={false} />
```

Or via slotProps:

```tsx
<GravityAd
  ad={ad}
  slotProps={{
    label: { style: { display: 'none' } },
  }}
/>
```

### No shadow, flat look

```tsx
<GravityAd ad={ad} style={{ boxShadow: 'none' }} />
```

### Full-width CTA

```tsx
<GravityAd
  ad={ad}
  slotProps={{
    cta: { style: { alignSelf: 'stretch', textAlign: 'center' } },
  }}
/>
```

## Escape hatches

**`<AdText />`** — Renders only `ad.adText` as a plain link/span with zero built-in styles. You get full control and still get automatic impression tracking.

**`useAdTracking`** — Build your own component from scratch. The hook handles impression (via IntersectionObserver) and click tracking. You handle all rendering.

```tsx
import { useAdTracking } from '@gravity-ai/react';

function MyAd({ ad }) {
  const { containerRef, handleClick } = useAdTracking({ ad });

  return (
    <a ref={containerRef} href={ad.clickUrl} onClick={handleClick}>
      {/* render whatever you want */}
    </a>
  );
}
```
