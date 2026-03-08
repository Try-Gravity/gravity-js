import type { CSSProperties, ReactNode } from 'react';
import type { GravityAdVariant } from '@gravity-ai/react';

export type ContextInterfaceId = 'chat' | 'search' | 'ide' | 'agent';

export interface ContextProps {
  children: ReactNode;
  mode: 'light' | 'dark';
  variant: GravityAdVariant;
  adBody: string;
}

const HYPERLINK_VARIANTS = ['hyperlink', 'text-link'];

function isHyperlink(v: GravityAdVariant) { return HYPERLINK_VARIANTS.includes(v); }

// ── Shared styles ────────────────────────────────────────────────

const avatarDot = (color: string): CSSProperties => ({
  width: 6, height: 6, borderRadius: 3, background: color, flexShrink: 0,
});

const labelRow = (mode: 'light' | 'dark'): CSSProperties => ({
  fontSize: 11, fontWeight: 600, color: mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
  marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
});

// ── 1. AI Chat ───────────────────────────────────────────────────

export function ChatContext({ children, mode, variant, adBody }: ContextProps) {
  const hyperlink = isHyperlink(variant);

  const msgStyle = (isUser: boolean): CSSProperties => ({
    fontSize: 13.5, lineHeight: 1.6, color: 'var(--fg)',
    ...(isUser ? {
      background: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      borderRadius: '16px 4px 16px 16px',
      padding: '12px 16px',
      maxWidth: '85%',
    } : {}),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ ...labelRow(mode), alignSelf: 'flex-end' }}>
          <div style={avatarDot(mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)')} /> You
        </div>
        <div style={msgStyle(true)}>
          What tools can help me monetize my AI chatbot without ruining the user experience?
        </div>
      </div>

      <div>
        <div style={labelRow(mode)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          Assistant
        </div>
        <div style={msgStyle(false)}>
          <p style={{ margin: '0 0 12px' }}>There are a few approaches that work well for AI platforms looking to generate revenue without disrupting conversations:</p>
          <p style={{ margin: hyperlink ? 0 : '0 0 12px' }}>
            <strong>Contextual native ads</strong> are the most popular option. They analyze the conversation topic and serve relevant brand placements that feel like natural recommendations rather than interruptions.
          </p>
          {hyperlink && (
            <p style={{ margin: '12px 0 0' }}>
              For example, platforms like {children} make this seamless by matching ads to conversation context.
            </p>
          )}
        </div>
      </div>

      {!hyperlink && (
        <div>{children}</div>
      )}
    </div>
  );
}

// ── 2. AI Search ─────────────────────────────────────────────────

export function SearchContext({ children, mode, variant, adBody }: ContextProps) {
  const hyperlink = isHyperlink(variant);
  const dm = mode === 'dark';
  const muted = dm ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const subtle = dm ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const border = dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const sourcePill = (name: string, i: number): CSSProperties => ({
    fontSize: 11, padding: '4px 10px', borderRadius: 6,
    background: subtle, color: muted,
    display: 'inline-flex', alignItems: 'center', gap: 5,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: '100%' }}>
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: subtle, border: `1px solid ${border}`,
        fontSize: 13, color: 'var(--fg)', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        How to monetize an AI platform
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', alignSelf: 'center', marginRight: 4 }}>Sources</div>
        {['TechCrunch', 'a16z Blog', 'Y Combinator', 'Wired'].map((s, i) => (
          <span key={s} style={sourcePill(s, i)}>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i] }} />
            {s}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--fg)' }}>
        <p style={{ margin: '0 0 12px' }}>
          AI platforms have several proven monetization strategies. The most effective approach for conversational AI is <strong>contextual native advertising</strong>, which integrates sponsored content directly into AI responses without disrupting the user experience.
          <sup style={{ color: dm ? '#60A5FA' : '#2563EB', fontSize: 10 }}>[1]</sup>
        </p>
        <p style={{ margin: '0 0 12px' }}>
          Unlike traditional display ads, native AI ads analyze conversation context to serve relevant recommendations. This approach sees 3-5x higher engagement rates compared to banner ads.
          <sup style={{ color: dm ? '#60A5FA' : '#2563EB', fontSize: 10 }}>[2]</sup>
        </p>
        {hyperlink && (
          <p style={{ margin: '0 0 12px' }}>
            Platforms like {children} provide SDKs that make integration straightforward for developers.
            <sup style={{ color: dm ? '#60A5FA' : '#2563EB', fontSize: 10 }}>[3]</sup>
          </p>
        )}
        <p style={{ margin: 0 }}>
          Key factors include maintaining user trust, ensuring ad relevance, and providing transparent disclosure.
          <sup style={{ color: dm ? '#60A5FA' : '#2563EB', fontSize: 10 }}>[3]</sup>
        </p>
      </div>

      {!hyperlink && (
        <div style={{ marginTop: 16 }}>{children}</div>
      )}

      <div style={{
        marginTop: 20, paddingTop: 16,
        borderTop: `1px solid ${border}`,
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: muted, fontWeight: 500 }}>Related:</span>
        {['AI monetization strategies', 'Native ad SDKs', 'Publisher revenue'].map(q => (
          <span key={q} style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 4,
            background: subtle, color: dm ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            cursor: 'pointer',
          }}>{q}</span>
        ))}
      </div>
    </div>
  );
}

// ── 3. Code Assistant ────────────────────────────────────────────

export function IDEContext({ children, mode, variant, adBody }: ContextProps) {
  const hyperlink = isHyperlink(variant);
  const dm = mode === 'dark';
  const panelBg = dm ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const border = dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const muted = dm ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const codeFg = dm ? '#E2E8F0' : '#334155';
  const keyword = dm ? '#C084FC' : '#7C3AED';
  const str = dm ? '#86EFAC' : '#16A34A';
  const comment = dm ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

  const tabStyle = (active: boolean): CSSProperties => ({
    fontSize: 11, padding: '6px 12px',
    color: active ? 'var(--fg)' : muted,
    borderBottom: active ? `2px solid ${dm ? '#60A5FA' : '#2563EB'}` : '2px solid transparent',
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', borderRadius: 8, overflow: 'hidden', border: `1px solid ${border}` }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        borderBottom: `1px solid ${border}`,
        background: panelBg,
      }}>
        <span style={tabStyle(false)}>app.ts</span>
        <span style={tabStyle(true)}>monetization.ts</span>
        <span style={tabStyle(false)}>config.ts</span>
      </div>

      <div style={{ display: 'flex', minHeight: 0, fontSize: 12 }}>
        <div style={{
          flex: '1 1 auto',
          padding: '12px 0', fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
          lineHeight: 1.7, overflow: 'hidden',
        }}>
          {[
            { n: 1, code: <><span style={{ color: keyword }}>import</span> <span style={{ color: codeFg }}>{'{ GravityAd }'}</span> <span style={{ color: keyword }}>from</span> <span style={{ color: str }}>'@gravity-ai/react'</span>;</> },
            { n: 2, code: <><span style={{ color: keyword }}>import</span> <span style={{ color: codeFg }}>{'{ useGravity }'}</span> <span style={{ color: keyword }}>from</span> <span style={{ color: str }}>'./hooks'</span>;</> },
            { n: 3, code: <></> },
            { n: 4, code: <><span style={{ color: comment }}>{'// Fetch contextual ad based on conversation'}</span></> },
            { n: 5, code: <><span style={{ color: keyword }}>const</span> <span style={{ color: codeFg }}>{'{ ad } = useGravity({ context })'}</span>;</> },
            { n: 6, code: <></> },
            { n: 7, code: <><span style={{ color: keyword }}>return</span> <span style={{ color: codeFg }}>{'('}</span></> },
            { n: 8, code: <><span style={{ color: codeFg }}>{'  <'}</span><span style={{ color: dm ? '#60A5FA' : '#2563EB' }}>GravityAd</span> <span style={{ color: dm ? '#F9A8D4' : '#DB2777' }}>ad</span><span style={{ color: codeFg }}>{'={ad} />'}</span></> },
            { n: 9, code: <><span style={{ color: codeFg }}>{')'}</span>;</> },
          ].map(l => (
            <div key={l.n} style={{ display: 'flex', paddingLeft: 0 }}>
              <span style={{ width: 36, textAlign: 'right', color: muted, fontSize: 11, paddingRight: 12, userSelect: 'none' as const, flexShrink: 0 }}>{l.n}</span>
              <span style={{ color: codeFg }}>{l.code}</span>
            </div>
          ))}
        </div>

        <div style={{
          width: '55%', borderLeft: `1px solid ${border}`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderBottom: `1px solid ${border}`,
            background: panelBg,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={dm ? '#60A5FA' : '#2563EB'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg)' }}>AI Assistant</span>
          </div>

          <div style={{ padding: 14, fontSize: 13, lineHeight: 1.6, color: 'var(--fg)', overflowY: 'auto' as const }}>
            <p style={{ margin: '0 0 10px' }}>
              Here's how to integrate monetization into your AI app. The SDK handles ad fetching and context matching automatically.
            </p>
            {hyperlink && (
              <p style={{ margin: '0 0 10px' }}>
                For production use, check out {children} for best practices on native ad integration.
              </p>
            )}
            {!hyperlink && (
              <div style={{ margin: '10px 0' }}>{children}</div>
            )}
            <p style={{ margin: 0, fontSize: 12, color: muted }}>
              The ad component adapts its style to match your interface automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. AI Agent ──────────────────────────────────────────────────

export function AgentContext({ children, mode, variant, adBody }: ContextProps) {
  const hyperlink = isHyperlink(variant);
  const dm = mode === 'dark';
  const border = dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const muted = dm ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const subtle = dm ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const green = dm ? '#4ADE80' : '#16A34A';
  const blue = dm ? '#60A5FA' : '#2563EB';

  const stepDot = (done: boolean, active: boolean): CSSProperties => ({
    width: 8, height: 8, borderRadius: 4, flexShrink: 0,
    background: done ? green : active ? blue : border,
    boxShadow: active ? `0 0 0 3px ${dm ? 'rgba(96,165,250,0.15)' : 'rgba(37,99,235,0.1)'}` : 'none',
  });

  const stepLine = (done: boolean): CSSProperties => ({
    width: 1, height: 20, background: done ? green : border,
    marginLeft: 3.5, flexShrink: 0,
  });

  const steps: { label: string; detail: string; done: boolean; active: boolean }[] = [
    { label: 'Analyzing requirements', detail: 'Parsed project structure', done: true, active: false },
    { label: 'Setting up dependencies', detail: 'Installed @gravity-ai/react', done: true, active: false },
    { label: 'Integrating ad SDK', detail: 'Configuring placement...', done: false, active: true },
    { label: 'Running tests', detail: 'Pending', done: false, active: false },
  ];

  return (
    <div style={{ display: 'flex', width: '100%', gap: 0, borderRadius: 8, overflow: 'hidden', border: `1px solid ${border}` }}>
      <div style={{
        width: 200, flexShrink: 0, padding: '14px 16px',
        borderRight: `1px solid ${border}`, background: subtle,
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: muted, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 14 }}>
          Task Progress
        </div>
        {steps.map((s, i) => (
          <div key={s.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={stepDot(s.done, s.active)} />
              <div>
                <div style={{ fontSize: 11.5, fontWeight: s.active ? 600 : 400, color: s.done ? 'var(--fg)' : s.active ? 'var(--fg)' : muted }}>{s.label}</div>
                <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>{s.detail}</div>
              </div>
            </div>
            {i < steps.length - 1 && <div style={stepLine(s.done)} />}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '8px 14px', borderBottom: `1px solid ${border}`,
          background: subtle, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: green }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg)' }}>Agent</span>
          <span style={{ fontSize: 10, color: muted, marginLeft: 'auto' }}>Step 3 of 4</span>
        </div>

        <div style={{ padding: 16, fontSize: 13, lineHeight: 1.6, color: 'var(--fg)' }}>
          <p style={{ margin: '0 0 10px' }}>
            I've installed the Gravity SDK and I'm now configuring the ad placement. The SDK provides native components that adapt to your interface automatically.
          </p>
          <div style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 11.5,
            padding: '8px 12px', borderRadius: 6, background: subtle,
            border: `1px solid ${border}`, marginBottom: 12, color: 'var(--fg)',
          }}>
            <span style={{ color: muted }}>$</span> npm install @gravity-ai/react
          </div>
          {hyperlink && (
            <p style={{ margin: '0 0 10px' }}>
              Based on your project, I recommend using {children} for the best fit with your stack.
            </p>
          )}
          {!hyperlink && (
            <div style={{ margin: '10px 0' }}>{children}</div>
          )}
          <p style={{ margin: 0, fontSize: 12, color: muted }}>
            Next: Running integration tests to verify ad rendering.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Interface registry ───────────────────────────────────────────

export const CONTEXT_INTERFACES: { id: ContextInterfaceId; label: string; icon: ReactNode }[] = [
  {
    id: 'chat',
    label: 'AI Chat',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: 'search',
    label: 'AI Search',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
  {
    id: 'ide',
    label: 'Code Assistant',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  },
  {
    id: 'agent',
    label: 'AI Agent',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="12" cy="14" r="2"/><path d="M12 16v2"/></svg>,
  },
];

export function ContextRenderer({ interfaceId, ...props }: ContextProps & { interfaceId: ContextInterfaceId }) {
  switch (interfaceId) {
    case 'chat': return <ChatContext {...props} />;
    case 'search': return <SearchContext {...props} />;
    case 'ide': return <IDEContext {...props} />;
    case 'agent': return <AgentContext {...props} />;
    default: return <ChatContext {...props} />;
  }
}

