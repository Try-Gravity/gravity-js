# @gravity-ai/react

React components for rendering Gravity ads with automatic impression and click tracking.

## Installation

```bash
npm install @gravity-ai/react
```

> Peer dependency: React 17+

## Quick Start

```tsx
import { GravityAd } from '@gravity-ai/react';

function ChatResponse({ ads }) {
  return ads.map((ad, i) => <GravityAd key={i} ad={ad} />);
}
```

That's it. The component renders a styled ad card using inline styles and automatically fires the impression pixel when the ad scrolls into view.

## API Response Shape

The components expect the objects returned by the Gravity API:

```ts
interface AdResponse {
  adText: string;
  title?: string;
  cta?: string;
  brandName?: string;
  url?: string;
  favicon?: string;
  impUrl?: string;   // impression tracking pixel
  clickUrl?: string;  // click-through URL
}
```

## Components

### `<GravityAd />`

Full-featured ad card with favicon, brand name, title, body text, and CTA button. All styles are inline — no injected stylesheets, no CSS class names, no CSS-in-JS. What you see in the JSX is what renders.

```tsx
<GravityAd
  ad={ad}
  variant="card"       // "card" | "inline" | "minimal"
  showLabel={true}     // show "Sponsored" label
  labelText="Sponsored"
  openInNewTab={true}
  onImpression={() => console.log('seen')}
  onClickTracked={() => console.log('clicked')}
/>
```

**Variants:**

| Variant | Description |
|---------|-------------|
| `card` | Default. Vertical card with border, shadow, and padding. |
| `inline` | Horizontal layout for sidebars or toolbars. |
| `minimal` | No border, shadow, or background. Blends with host content. |

### Styling with `style` and `slotProps`

Override the outer container with the `style` prop:

```tsx
<GravityAd ad={ad} style={{ maxWidth: 400, borderRadius: 16 }} />
```

Override any inner element with `slotProps`:

```tsx
<GravityAd
  ad={ad}
  slotProps={{
    cta: { style: { background: '#E11D48', borderRadius: 999 } },
    label: { style: { display: 'none' } },
    title: { style: { fontSize: 16 } },
  }}
/>
```

Each `slotProps` key maps to a DOM element:

| Key | Element | What it controls |
|-----|---------|------------------|
| `container` | Outer `<a>` | Same as top-level `style` prop |
| `inner` | Padding wrapper `<div>` | Layout, padding, gap |
| `header` | Header row `<div>` | Favicon + brand + label row |
| `favicon` | Favicon `<img>` | Size, border-radius |
| `brand` | Brand name `<span>` | Font, color |
| `label` | "Sponsored" `<span>` | Pill styling, visibility |
| `body` | Body wrapper `<div>` | Title + text layout |
| `title` | Title `<p>` | Font, color |
| `text` | Ad text `<p>` | Font, color |
| `cta` | CTA button `<span>` | Background, border-radius, padding |

Each slot accepts `{ style?: CSSProperties; className?: string }`.

For the full styling guide with DOM structure and common recipes, see **[STYLING.md](./STYLING.md)**.

### `<AdText />`

Unstyled text-only renderer. Use when you want full control over presentation.

```tsx
<AdText
  ad={ad}
  className="my-custom-style"
  style={{ fontSize: 14 }}
/>
```

Renders `ad.adText` as a link (if `clickUrl` exists) or a span. No built-in styles beyond `text-decoration: none; color: inherit`.

## Impression Tracking

Both components use `IntersectionObserver` to fire the impression pixel **only when the ad is actually visible** to the user (50% of the element in the viewport). This is a significant improvement over fire-on-mount — publishers won't report impressions for ads rendered below the fold that were never seen.

The impression fires exactly once per ad. If the ad object changes (different `impUrl`), the tracking resets for the new ad.

To disable automatic tracking:

```tsx
<GravityAd ad={ad} disableImpressionTracking />
```

## Hooks

### `useAdTracking`

Low-level hook for building fully custom ad components:

```tsx
import { useAdTracking } from '@gravity-ai/react';

function CustomAd({ ad }) {
  const { containerRef, handleClick } = useAdTracking({
    ad,
    onImpression: () => console.log('impression fired'),
    onClickTracked: () => console.log('click tracked'),
  });

  return (
    <a ref={containerRef} href={ad.clickUrl} onClick={handleClick}>
      {ad.adText}
    </a>
  );
}
```

The hook returns:
- `containerRef` — attach to the DOM element for IntersectionObserver-based impression tracking
- `handleClick` — call on click to fire the click tracking callback
- `impressionFired` — boolean indicating whether the impression has already been fired

## License

MIT
