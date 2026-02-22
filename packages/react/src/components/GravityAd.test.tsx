import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GravityAd } from './GravityAd';
import type { AdResponse } from '../types';

const mockImageInstances: { src?: string }[] = [];
const OriginalImage = globalThis.Image;

let intersectionCallback: IntersectionObserverCallback;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockImageInstances.length = 0;
  globalThis.Image = class MockImage {
    src?: string;
    constructor() {
      mockImageInstances.push(this);
    }
  } as unknown as typeof Image;

  mockObserve.mockReset();
  mockDisconnect.mockReset();

  globalThis.IntersectionObserver = class MockIntersectionObserver {
    constructor(cb: IntersectionObserverCallback) {
      intersectionCallback = cb;
    }
    observe = mockObserve;
    unobserve = vi.fn();
    disconnect = mockDisconnect;
    root = null;
    rootMargin = '';
    thresholds = [0];
    takeRecords = () => [];
  } as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  globalThis.Image = OriginalImage;
});

function simulateVisible() {
  intersectionCallback(
    [{ isIntersecting: true } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

const fullAd: AdResponse = {
  adText: 'Looking for marathon gear? Check out the latest collection...',
  title: 'Nike Running',
  cta: 'Shop Now',
  brandName: 'Nike',
  url: 'https://nike.com/running',
  favicon: 'https://nike.com/favicon.ico',
  impUrl: 'https://server.trygravity.ai/t/imp?abc',
  clickUrl: 'https://server.trygravity.ai/t/click?abc',
};

const minimalAd: AdResponse = {
  adText: 'Simple ad text only.',
  impUrl: 'https://server.trygravity.ai/t/imp?min',
  clickUrl: 'https://server.trygravity.ai/t/click?min',
};

describe('GravityAd', () => {
  it('renders all ad fields', () => {
    render(<GravityAd ad={fullAd} />);
    expect(screen.getByText('Nike Running')).toBeInTheDocument();
    expect(screen.getByText('Nike')).toBeInTheDocument();
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
    expect(screen.getByText(/Looking for marathon gear/)).toBeInTheDocument();
    expect(screen.getByText('Sponsored')).toBeInTheDocument();

    const favicon = screen.getByRole('img', { hidden: true });
    expect(favicon).toHaveAttribute('src', 'https://nike.com/favicon.ico');
  });

  it('renders fallback when ad is null', () => {
    render(<GravityAd ad={null} fallback={<div>No ad</div>} />);
    expect(screen.getByText('No ad')).toBeInTheDocument();
  });

  it('renders nothing when ad is null and no fallback', () => {
    const { container } = render(<GravityAd ad={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('gracefully handles missing optional fields', () => {
    render(<GravityAd ad={minimalAd} />);
    expect(screen.getByText('Simple ad text only.')).toBeInTheDocument();
    expect(screen.queryByText('Nike')).not.toBeInTheDocument();
    expect(screen.queryByText('Shop Now')).not.toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<GravityAd ad={fullAd} showLabel={false} />);
    expect(screen.queryByText('Sponsored')).not.toBeInTheDocument();
  });

  it('uses custom label text', () => {
    render(<GravityAd ad={fullAd} labelText="Ad" />);
    expect(screen.getByText('Ad')).toBeInTheDocument();
    expect(screen.queryByText('Sponsored')).not.toBeInTheDocument();
  });

  it('renders as a link with clickUrl', () => {
    render(<GravityAd ad={fullAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', fullAd.clickUrl);
  });

  it('opens in new tab by default', () => {
    render(<GravityAd ad={fullAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored');
  });

  it('opens in same tab when openInNewTab=false', () => {
    render(<GravityAd ad={fullAd} openInNewTab={false} />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
    expect(link).toHaveAttribute('rel', 'sponsored');
  });

  it('applies data-gravity-ad attribute', () => {
    render(<GravityAd ad={fullAd} />);
    expect(screen.getByRole('link')).toHaveAttribute('data-gravity-ad');
  });

  it('applies custom className to the outer link', () => {
    render(<GravityAd ad={fullAd} className="my-custom" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('my-custom');
  });

  it('applies inline styles to the outer container', () => {
    render(<GravityAd ad={fullAd} />);
    const link = screen.getByRole('link');
    expect(link.style.background).toBe('rgb(255, 255, 255)');
    expect(link.style.cursor).toBe('pointer');
  });

  it('merges top-level style prop onto container', () => {
    render(<GravityAd ad={fullAd} style={{ maxWidth: 400 }} />);
    const link = screen.getByRole('link');
    expect(link.style.maxWidth).toBe('400px');
    expect(link.style.background).toBe('rgb(255, 255, 255)');
  });

  describe('slotProps', () => {
    it('overrides inner element styles via slotProps', () => {
      render(
        <GravityAd
          ad={fullAd}
          slotProps={{
            cta: { style: { background: 'red', borderRadius: 999 } },
          }}
        />,
      );
      const cta = screen.getByText('Shop Now');
      expect(cta.style.background).toBe('red');
      expect(cta.style.borderRadius).toBe('999px');
    });

    it('applies slotProps className to inner elements', () => {
      render(
        <GravityAd
          ad={fullAd}
          slotProps={{
            label: { className: 'custom-label' },
          }}
        />,
      );
      const label = screen.getByText('Sponsored');
      expect(label.className).toContain('custom-label');
    });

    it('can hide elements via slotProps style', () => {
      render(
        <GravityAd
          ad={fullAd}
          slotProps={{
            label: { style: { display: 'none' } },
          }}
        />,
      );
      const label = screen.getByText('Sponsored');
      expect(label.style.display).toBe('none');
    });
  });

  describe('impression tracking', () => {
    it('does NOT fire impression on mount (waits for visibility)', () => {
      render(<GravityAd ad={fullAd} />);
      expect(mockObserve).toHaveBeenCalled();
      expect(mockImageInstances.length).toBe(0);
    });

    it('fires impression when element becomes visible', () => {
      render(<GravityAd ad={fullAd} />);
      simulateVisible();
      expect(mockImageInstances.length).toBe(1);
      expect(mockImageInstances[0].src).toBe(fullAd.impUrl);
    });

    it('fires impression only once even if observed multiple times', () => {
      render(<GravityAd ad={fullAd} />);
      simulateVisible();
      simulateVisible();
      expect(mockImageInstances.length).toBe(1);
    });

    it('does not fire when disableImpressionTracking is true', () => {
      render(<GravityAd ad={fullAd} disableImpressionTracking />);
      simulateVisible();
      expect(mockImageInstances.length).toBe(0);
    });

    it('does not fire when no impUrl', () => {
      const adNoImp = { ...fullAd, impUrl: undefined };
      render(<GravityAd ad={adNoImp} />);
      expect(mockObserve).not.toHaveBeenCalled();
    });

    it('calls onImpression callback when impression fires', () => {
      const onImpression = vi.fn();
      render(<GravityAd ad={fullAd} onImpression={onImpression} />);
      simulateVisible();
      expect(onImpression).toHaveBeenCalledTimes(1);
    });

    it('disconnects observer after impression fires', () => {
      render(<GravityAd ad={fullAd} />);
      simulateVisible();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('click tracking', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<GravityAd ad={fullAd} onClick={onClick} />);
      fireEvent.click(screen.getByRole('link'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClickTracked when clicked', () => {
      const onClickTracked = vi.fn();
      render(<GravityAd ad={fullAd} onClickTracked={onClickTracked} />);
      fireEvent.click(screen.getByRole('link'));
      expect(onClickTracked).toHaveBeenCalledTimes(1);
    });
  });

  describe('variants', () => {
    it('uses card styles by default (has border, shadow)', () => {
      render(<GravityAd ad={fullAd} />);
      const el = screen.getByRole('link');
      expect(el.style.border).toContain('1px solid');
      expect(el.style.boxShadow).toBeTruthy();
    });

    it('inline variant renders horizontal layout', () => {
      render(<GravityAd ad={fullAd} variant="inline" />);
      const el = screen.getByRole('link');
      expect(el.style.overflow).toBe('visible');
    });

    it('minimal variant has no border or shadow', () => {
      render(<GravityAd ad={fullAd} variant="minimal" />);
      const el = screen.getByRole('link');
      // jsdom clears border when set to 'none', so it won't contain 'solid'
      expect(el.style.border).not.toContain('solid');
      expect(el.style.boxShadow).toBe('none');
      expect(el.style.background).toBe('transparent');
    });
  });
});
