# @gravity-ai/react

React components for rendering Gravity AI advertisements with automatic impression and click tracking.

## Installation

```bash
npm install @gravity-ai/react
```

> **Note:** This package has a peer dependency on React 17+.

## Quick Start

```tsx
import { Client } from '@gravity-ai/api';
import { AdBanner } from '@gravity-ai/react';
import { useEffect, useState } from 'react';

const client = new Client('your-api-key');

function ChatMessage({ messages }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    client.getAd({ messages }).then(setAd);
  }, [messages]);

  return (
    <div>
      {/* Your chat content */}
      <AdBanner ad={ad} theme="dark" size="medium" />
    </div>
  );
}
```

## Components

### `<AdBanner />`

A fully-styled, customizable ad banner component.

```tsx
import { AdBanner } from '@gravity-ai/react';

<AdBanner
  ad={adResponse}
  theme="dark"           // 'light' | 'dark' | 'minimal' | 'branded'
  size="medium"          // 'small' | 'medium' | 'large' | 'responsive'
  showLabel={true}       // Show "Sponsored" label
  labelText="Ad"         // Custom label text
  openInNewTab={true}    // Open click URL in new tab
  onImpression={() => console.log('Impression tracked')}
  onClickTracked={() => console.log('Click tracked')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ad` | `AdResponse \| null` | required | The ad response from Gravity API |
| `theme` | `'light' \| 'dark' \| 'minimal' \| 'branded'` | `'light'` | Visual theme preset |
| `size` | `'small' \| 'medium' \| 'large' \| 'responsive'` | `'medium'` | Size preset |
| `className` | `string` | - | Custom class name for container |
| `style` | `CSSProperties` | - | Custom inline styles |
| `showLabel` | `boolean` | `true` | Show "Sponsored" label |
| `labelText` | `string` | `'Sponsored'` | Custom label text |
| `fallback` | `ReactNode` | `null` | Content when ad is null |
| `openInNewTab` | `boolean` | `true` | Open link in new tab |
| `backgroundColor` | `string` | - | Custom background (overrides theme) |
| `textColor` | `string` | - | Custom text color (overrides theme) |
| `accentColor` | `string` | - | Custom accent color |
| `borderRadius` | `number \| string` | - | Custom border radius |
| `disableImpressionTracking` | `boolean` | `false` | Disable auto impression tracking |
| `onClick` | `() => void` | - | Custom click handler |
| `onImpression` | `() => void` | - | Callback when impression fires |
| `onClickTracked` | `() => void` | - | Callback when click is tracked |

### `<AdText />`

A minimal text-only component for full styling control.

```tsx
import { AdText } from '@gravity-ai/react';

<AdText
  ad={adResponse}
  className="my-custom-class"
  style={{ color: 'blue' }}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ad` | `AdResponse \| null` | required | The ad response from Gravity API |
| `className` | `string` | - | Custom class name |
| `style` | `CSSProperties` | - | Custom inline styles |
| `fallback` | `ReactNode` | `null` | Content when ad is null |
| `openInNewTab` | `boolean` | `true` | Open link in new tab |
| `disableImpressionTracking` | `boolean` | `false` | Disable auto tracking |
| `onClick` | `() => void` | - | Custom click handler |
| `onImpression` | `() => void` | - | Callback on impression |
| `onClickTracked` | `() => void` | - | Callback on click |

## Hooks

### `useAdTracking`

For building custom ad components with automatic tracking.

```tsx
import { useAdTracking } from '@gravity-ai/react';

function CustomAdComponent({ ad }) {
  const { handleClick } = useAdTracking({
    ad,
    onImpression: () => console.log('Viewed'),
    onClickTracked: () => console.log('Clicked'),
  });

  return (
    <a href={ad.clickUrl} onClick={handleClick}>
      {ad.adText}
    </a>
  );
}
```

## Theming Examples

### Dark Theme
```tsx
<AdBanner ad={ad} theme="dark" />
```

### Custom Colors
```tsx
<AdBanner
  ad={ad}
  backgroundColor="#1e1b4b"
  textColor="#e0e7ff"
  accentColor="#818cf8"
/>
```

### Minimal (Inherit Parent Styles)
```tsx
<AdBanner ad={ad} theme="minimal" showLabel={false} />
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import type { AdResponse, AdBannerProps, AdTheme, AdSize } from '@gravity-ai/react';
```

## License

MIT

