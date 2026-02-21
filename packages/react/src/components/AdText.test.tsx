import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdText } from './AdText';
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

const mockAd: AdResponse = {
  adText: 'Check out our amazing product!',
  impUrl: 'https://tracking.example.com/imp',
  clickUrl: 'https://example.com/landing',
};

describe('AdText', () => {
  it('renders ad text', () => {
    render(<AdText ad={mockAd} />);
    expect(screen.getByText('Check out our amazing product!')).toBeInTheDocument();
  });

  it('renders fallback when ad is null', () => {
    render(<AdText ad={null} fallback={<span>Fallback</span>} />);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it('renders nothing when ad is null and no fallback', () => {
    const { container } = render(<AdText ad={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders as link when clickUrl present', () => {
    render(<AdText ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', mockAd.clickUrl);
  });

  it('renders as span when no clickUrl', () => {
    render(<AdText ad={{ ...mockAd, clickUrl: undefined }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Check out our amazing product!').tagName).toBe('SPAN');
  });

  it('opens in new tab by default', () => {
    render(<AdText ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored');
  });

  it('opens in same tab when openInNewTab=false', () => {
    render(<AdText ad={mockAd} openInNewTab={false} />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
    expect(link).toHaveAttribute('rel', 'sponsored');
  });

  it('fires impression on visibility, not mount', () => {
    render(<AdText ad={mockAd} />);
    expect(mockImageInstances.length).toBe(0);
    simulateVisible();
    expect(mockImageInstances.length).toBe(1);
    expect(mockImageInstances[0].src).toBe(mockAd.impUrl);
  });

  it('does not fire impression when disabled', () => {
    render(<AdText ad={mockAd} disableImpressionTracking />);
    simulateVisible();
    expect(mockImageInstances.length).toBe(0);
  });

  it('calls onImpression callback', () => {
    const onImpression = vi.fn();
    render(<AdText ad={mockAd} onImpression={onImpression} />);
    simulateVisible();
    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<AdText ad={mockAd} onClick={onClick} />);
    fireEvent.click(screen.getByRole('link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClickTracked when clicked', () => {
    const onClickTracked = vi.fn();
    render(<AdText ad={mockAd} onClickTracked={onClickTracked} />);
    fireEvent.click(screen.getByRole('link'));
    expect(onClickTracked).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<AdText ad={mockAd} className="my-ad-text" />);
    expect(screen.getByRole('link')).toHaveClass('my-ad-text');
  });

  it('applies custom styles', () => {
    render(<AdText ad={mockAd} style={{ fontWeight: 'bold' }} />);
    expect(screen.getByRole('link')).toHaveStyle({ fontWeight: 'bold' });
  });

  it('applies data-gravity-ad attribute', () => {
    render(<AdText ad={mockAd} />);
    expect(screen.getByRole('link')).toHaveAttribute('data-gravity-ad');
  });

  it('inherits color by default', () => {
    render(<AdText ad={mockAd} />);
    expect(screen.getByRole('link')).toHaveStyle({ color: 'inherit' });
  });
});
