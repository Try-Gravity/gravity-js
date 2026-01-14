# Gravity SDK Examples

This directory contains example applications for testing and demonstrating the Gravity SDKs locally.

## Examples

| Example | Description |
|---------|-------------|
| [api-test](./api-test) | Node.js script for testing `@gravity-ai/api` |
| [react-test](./react-test) | React app playground for testing `@gravity-ai/react` |

---

## API Test (`api-test`)

A simple Node.js script to test the API client.

### Setup

1. **Build the API package first** (from repo root):
   ```bash
   cd ../..
   npm run build
   ```

2. **Create a `.env` file** in the `api-test` directory:
   ```bash
   cd examples/api-test
   echo "API_KEY=your-api-key-here" > .env
   ```

3. **Run the test**:
   ```bash
   node --env-file=.env index.js
   ```

   Or using npm:
   ```bash
   npm start
   ```

### Expected Output

```
Testing Gravity API Client...

Response: [
  {
    adText: 'Check out our amazing laptops...',
    title: 'Dell XPS 15',
    cta: 'Shop Now',
    brandName: 'Dell',
    url: 'https://example.com/laptops',
    impUrl: 'https://tracking.example.com/imp?id=123',
    clickUrl: 'https://tracking.example.com/click?id=123'
  }
]

Got 1 ad(s)
```

### API Usage

The SDK provides a single `getAd()` method for contextual ads:

```typescript
import { Client } from '@gravity-ai/api';

const client = new Client('your-api-key');

const ads = await client.getAd({
  messages: [
    { role: 'user', content: 'What laptop should I buy?' },
    { role: 'assistant', content: 'What is your budget?' }
  ],
  sessionId: 'session-123',
  placements: [{ placement: 'below_response', placement_id: 'main-ad' }],
  userId: 'user-456',  // optional
  device: { ip: '1.2.3.4' },  // optional
  excludedTopics: ['gambling'],  // optional
  relevancy: 0.5  // optional, 0-1
});

if (ads) {
  const ad = ads[0];
  console.log(ad.adText);

  // Fire impression when ad is displayed
  if (ad.impUrl) new Image().src = ad.impUrl;

  // Use clickUrl for the ad link
  window.open(ad.clickUrl);
}
```

---

## React Test (`react-test`)

An interactive React application for testing the React components in a browser.

### Setup

1. **Build the packages first** (from repo root):
   ```bash
   cd ../..
   npm run build
   ```

2. **Install dependencies**:
   ```bash
   cd examples/react-test
   npm install
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:5173

### Features

The playground lets you:

- **Switch themes**: Light, Dark, Minimal, Branded
- **Change sizes**: Small, Medium, Large, Responsive
- **Toggle options**: Show/hide sponsored label
- **Test states**: Full ad, short ad, or no ad (null)
- **View tracking**: See impression and click counts
- **Copy code**: Generated code example updates as you change options

### Screenshot

The app displays:
- `<AdBanner />` component with all theme/size combinations
- `<AdText />` minimal component with custom styling
- Custom styled banner example
- Live code snippet

---

## Notes

### Using Local Packages

Both examples import from the local `packages/` directory, not from npm. This lets you:

1. Make changes to the SDK code
2. Rebuild (`npm run build` from root)
3. See changes immediately in examples

### Environment Variables

For the API test, you need a valid Gravity API key. Create a `.env` file:

```
API_KEY=your-api-key-here
```

> Never commit your `.env` file - it's already in `.gitignore`

### React Test Mock Data

The React test uses **mock ad data** (no API key needed) to demonstrate the components. The mock data simulates what the real API would return.

To test with real API data, you can modify `examples/react-test/src/App.tsx` to call the actual API:

```tsx
import { Client } from '@gravity-ai/api';

const client = new Client('your-api-key');

// In your component:
useEffect(() => {
  client.getAd({
    messages,
    sessionId: 'session-123',
    placements: [{ placement: 'below_response', placement_id: 'main-ad' }]
  }).then(ads => setAd(ads?.[0] || null));
}, []);
```

### Ad Response Shape

The API returns a flat array of ads:

```typescript
interface Ad {
  adText: string;        // The ad copy
  title?: string;        // Ad title
  cta?: string;          // Call-to-action (e.g., 'Learn More')
  brandName?: string;    // Brand name
  url?: string;          // Landing page URL
  favicon?: string;      // Favicon URL
  impUrl?: string;       // Fire this URL when ad is displayed
  clickUrl?: string;     // Use as href for ad clicks
}
```
