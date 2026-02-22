# OpenTUI Ad Integration

```ts
import { createGravityAdCard } from '@gravity-ai/api/opentui';
```

`createGravityAdCard()` gives you a ready-to-use ad card with automatic impression tracking, click-to-open-browser, and hover affordance. Three lines to integrate. Every visual property is overridable.

Requires `@opentui/core` as a peer dependency (`bun add @opentui/core`).

---

## Quick Start

```ts
import { createGravityAdCard } from '@gravity-ai/api/opentui';

const adCard = createGravityAdCard({ renderer, input });
root.add(adCard.panel);

// When you receive an ad from the server:
adCard.showAd(ads[0]);

// To hide:
adCard.clear();
```

That's it. `showAd()` populates the card content, computes the correct height, fires the impression pixel, shows the panel, and wires click/hover. The card includes a default hover effect (brighter border + lighter background) to signal clickability.

---

## API

### `createGravityAdCard(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `renderer` | any | — | Required. OpenTUI renderer from `createCliRenderer()`. |
| `input` | any | — | Required. `InputRenderable` — focus returns here when hover ends. |
| `variant` | `'card' \| 'minimal'` | `'card'` | `'card'` = bordered card. `'minimal'` = no border/background. |
| `onImpression` | `(ad) => void` | — | Called when impression fires. |
| `onClick` | `(ad) => void` | — | Called when user clicks (before browser opens). |
| `panel` | `{ borderColor?, backgroundColor? }` | neutral grays | Style overrides for the outer panel. |
| `text` | `{ fg? }` | `#A1A1AA` | Style overrides for the body text. |
| `cta` | `{ fg? }` | `#2563EB` | Style overrides for the CTA text. |
| `label` | `{ fg? }` | `#71717A` | Style overrides for the "Ad" label. |
| `hoverPanel` | `{ borderColor?, backgroundColor? }` | brighter grays | Hover state overrides. |

### Return value

| Property | Type | Description |
|----------|------|-------------|
| `panel` | BoxRenderable | The root renderable — add to your render tree. |
| `showAd(ad)` | function | Populate the card and activate tracking. Pass `null` to hide. |
| `clear()` | function | Hide the card and reset all state. |
| `elements` | object | Direct access to inner renderables (`text`, `cta`, `label`). |
| `tracking` | GravityAdTracking | The underlying tracking instance. |

### Matching your app's theme

The default colors are intentionally neutral (dim grays) so they blend into any dark terminal. Override them to match your app's palette:

```ts
const adCard = createGravityAdCard({
  renderer, input,
  panel: { borderColor: '#334155', backgroundColor: '#0F172A' },
  text: { fg: '#94A3B8' },
  cta: { fg: '#38BDF8' },
  hoverPanel: { borderColor: '#38BDF8', backgroundColor: '#1E293B' },
});
```

### Accessing inner renderables

The `elements` object gives you direct access to every renderable in the card. Mutate them after creation for anything the options don't cover:

```ts
const adCard = createGravityAdCard({ renderer, input });

// Change the label text style
adCard.elements.label.fg = '#EF4444';

// Hide the CTA entirely
adCard.elements.cta.visible = false;
```

---

## Hover Affordance

> **The ad must be visibly interactive on hover.** This directly impacts click-through rate. Ads without a hover state see significantly lower engagement.

`createGravityAdCard()` ships with a default hover effect: brighter border + lighter background + pointer cursor. If you override it via `hoverPanel`, ensure the ad remains visually distinct on hover.

If you use the low-level `gravityAdTracking()` API instead, **you must implement hover yourself**. At minimum:

```ts
const tracking = gravityAdTracking({
  renderer, input,
  panel: adPanel,
  clickTargets: [adText, adCta],
  onHoverIn: () => {
    adPanel.borderColor = '#71717A';  // brighter than resting state
    adPanel.backgroundColor = '#18181B';
    input.blur();
    renderer.setCursorStyle({ cursor: 'pointer', style: 'block', blinking: false });
    renderer.setMousePointer('pointer');
  },
  onHoverOut: () => {
    adPanel.borderColor = '#3F3F46';  // restore resting state
    adPanel.backgroundColor = '#09090B';
    renderer.setCursorStyle({ cursor: 'default', style: 'block', blinking: false });
    renderer.setMousePointer('default');
    input.focus();
  },
});
```

---

## Custom Layouts with `gravityAdTracking()`

For full control over the ad layout, use the low-level `gravityAdTracking()` primitive. You build the renderables, the SDK wires impression firing, click-to-open-browser, and hover/click.

```ts
import { gravityAdTracking } from '@gravity-ai/api/opentui';
import { BoxRenderable, TextRenderable, bold, fg, t } from '@opentui/core';

const adPanel = new BoxRenderable(renderer, {
  width: '100%', border: true, borderStyle: 'single',
  borderColor: '#3F3F46', paddingLeft: 2, paddingRight: 2,
  visible: false, backgroundColor: '#09090B', flexDirection: 'column',
});
const adText = new TextRenderable(renderer, { width: '100%', wrapMode: 'word', content: '' });
const adCta = new TextRenderable(renderer, { wrapMode: 'none', content: '', fg: '#2563EB' });
adPanel.add(adText);
adPanel.add(adCta);
root.add(adPanel);

const tracking = gravityAdTracking({
  renderer, input,
  panel: adPanel,
  clickTargets: [adText, adCta],
  // Hover affordance is required — see "Hover Affordance" section above.
  onHoverIn: () => {
    adPanel.borderColor = '#71717A';
    adPanel.backgroundColor = '#18181B';
    input.blur();
    renderer.setCursorStyle({ cursor: 'pointer', style: 'block', blinking: false });
    renderer.setMousePointer('pointer');
  },
  onHoverOut: () => {
    adPanel.borderColor = '#3F3F46';
    adPanel.backgroundColor = '#09090B';
    renderer.setCursorStyle({ cursor: 'default', style: 'block', blinking: false });
    renderer.setMousePointer('default');
    input.focus();
  },
});

function showAd(ad) {
  adText.content = t`${bold(ad.title || 'Sponsored')}
${fg('#A1A1AA')(ad.adText)}`;
  adCta.content = ad.cta || '';
  tracking.setAd(ad);  // fires impression, shows panel, wires click
}
```

### `gravityAdTracking(options)`

| Option | Type | Description |
|--------|------|-------------|
| `renderer` | any | Required. OpenTUI renderer from `createCliRenderer()`. |
| `input` | any | Required. `InputRenderable` — focus returns here when hover ends. |
| `panel` | any | Required. Root renderable. `visible` is toggled by `setAd()`/`clear()`. |
| `clickTargets` | any[] | Renderables that respond to hover/click. Panel is included automatically. Mouse events do not bubble in OpenTUI — list every child renderable that should be interactive. |
| `onImpression` | `(ad) => void` | Called when impression fires. |
| `onClick` | `(ad) => void` | Called when user clicks (before browser opens). |
| `onHoverIn` | `(ad) => void` | Custom hover-on. Replaces default cursor/pointer logic. |
| `onHoverOut` | `() => void` | Custom hover-off. Replaces default cursor/pointer logic. |

### Return value

| Property | Type | Description |
|----------|------|-------------|
| `setAd(ad)` | function | Activate tracking for an ad. Pass `null` to clear. |
| `clear()` | function | Hide panel and reset all state. |
| `ad` | `Ad \| null` | Currently active ad. |
| `impressionFired` | boolean | Whether impression has fired for current ad. |

### What `setAd()` does

1. Sets `panel.visible = true`
2. Fires `fetch(ad.impUrl)` (impression pixel)
3. Calls `onImpression(ad)` if provided
4. Wires `ad.clickUrl` to open in system browser on click
5. Enables hover cursor changes on all `clickTargets`

### What `clear()` does

1. Sets `panel.visible = false`
2. Resets cursor and mouse pointer
3. Clears internal state

---

## Ad Response Shape

The `Ad` type from `@gravity-ai/api`:

```ts
interface Ad {
  adText: string;       // body copy
  title?: string;       // headline
  cta?: string;         // call-to-action ("Learn More", "Get Started")
  brandName?: string;   // advertiser name
  url?: string;         // landing page URL
  favicon?: string;     // brand icon URL
  impUrl?: string;      // impression pixel — fire on render
  clickUrl?: string;    // click-through URL — open on click
}
```

## Custom Templating

If you skip both `createGravityAdCard` and `gravityAdTracking` entirely and handle everything yourself, the only two requirements are:

1. Fire `fetch(ad.impUrl).catch(() => {})` when the ad is displayed
2. Open `ad.clickUrl || ad.url` in the system browser on click
