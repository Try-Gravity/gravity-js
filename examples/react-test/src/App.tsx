import { useState } from 'react';
import { AdBanner, AdText } from '@gravity-ai/react';
import type { AdResponse, AdTheme, AdSize } from '@gravity-ai/react';

// Mock ad data for testing (simulates API response)
const mockAd: AdResponse = {
  adText: 'Checkout the new Gravity AI React SDK! Perfect for building custom ad components.',
  impUrl: '',
  clickUrl: '',
  payout: 0.03,
};

function App() {
  const [ad, setAd] = useState<AdResponse | null>(mockAd);
  const [theme, setTheme] = useState<AdTheme>('dark');
  const [size, setSize] = useState<AdSize>('medium');
  const [showLabel, setShowLabel] = useState(true);

  const themes: AdTheme[] = ['light', 'dark', 'minimal', 'branded'];
  const sizes: AdSize[] = ['small', 'medium', 'large', 'responsive'];

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#f5f5f0',
          marginBottom: '8px',
          fontWeight: 600
        }}>
          @gravity-ai/react
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '1.1rem' }}>
          Interactive component playground
        </p>
      </header>

      {/* Controls */}
      <section style={{ 
        background: '#2a2a2a', 
        borderRadius: '12px', 
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #3a3a3a'
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', color: '#e8e4de' }}>Controls</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Theme</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as AdTheme)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#1e1e1e',
                color: '#e8e4de',
                fontSize: '14px'
              }}
            >
              {themes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Size</label>
            <select 
              value={size} 
              onChange={(e) => setSize(e.target.value as AdSize)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#1e1e1e',
                color: '#e8e4de',
                fontSize: '14px'
              }}
            >
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Ad Data</label>
            <select 
              value={ad === null ? 'none' : 'ad'} 
              onChange={(e) => setAd(e.target.value === 'none' ? null : mockAd)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#1e1e1e',
                color: '#e8e4de',
                fontSize: '14px'
              }}
            >
              <option value="ad">Ad Text</option>
              <option value="none">No Ad</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Options</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#e8e4de' }}>
              <input 
                type="checkbox" 
                checked={showLabel} 
                onChange={(e) => setShowLabel(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Show "Sponsored" label
            </label>
          </div>
        </div>
      </section>

      {/* AdBanner Demo */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', color: '#e8e4de' }}>
          {'<AdBanner />'}
        </h2>
        <div style={{ 
          background: theme === 'light' ? '#f5f5f5' : '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #3a3a3a'
        }}>
          <AdBanner
            ad={ad}
            theme={theme}
            size={size}
            showLabel={showLabel}
            fallback={
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#707070',
                border: '2px dashed #444',
                borderRadius: '8px'
              }}>
                No ad available (fallback content)
              </div>
            }
          />
        </div>
      </section>

      {/* AdText Demo */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', color: '#e8e4de' }}>
          {'<AdText />'}
        </h2>
        <p style={{ color: '#a0a0a0', marginBottom: '12px' }}>
          A minimal component for custom styling. The ad text below is styled by the parent:
        </p>
        <div style={{ 
          background: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          borderLeft: '4px solid #707070'
        }}>
          <AdText
            ad={ad}
            style={{ 
              color: '#c8c4be',
              fontSize: '15px',
              lineHeight: '1.6'
            }}
            fallback={<span style={{ color: '#606060' }}>No ad to display</span>}
          />
        </div>
      </section>

      {/* Custom Styling Demo */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', color: '#e8e4de' }}>
          Custom Styled Banner
        </h2>
        <AdBanner
          ad={ad}
          backgroundColor="#1e1e1e"
          textColor="#e8e4de"
          accentColor="#a0a0a0"
          borderRadius={16}
          showLabel={showLabel}
          labelText="Ad"
          style={{
            border: '1px solid #3a3a3a',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
          fallback={null}
        />
      </section>

      {/* Code Example */}
      <section>
        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', color: '#e8e4de' }}>Usage Code</h2>
        <pre style={{
          background: '#1e1e1e',
          padding: '20px',
          borderRadius: '12px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#c8c4be',
          border: '1px solid #3a3a3a'
        }}>
{`import { AdBanner } from '@gravity-ai/react';

<AdBanner
  ad={ad}
  theme="${theme}"
  size="${size}"
  showLabel={${showLabel}}
  onImpression={() => console.log('Viewed')}
  onClickTracked={() => console.log('Clicked')}
/>`}
        </pre>
      </section>
    </div>
  );
}

export default App;
