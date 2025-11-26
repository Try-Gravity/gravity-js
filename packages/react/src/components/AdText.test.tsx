import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdText } from './AdText';
import type { AdResponse } from '../types';

// Mock Image constructor for impression tracking
const mockImageInstances: { src?: string }[] = [];
const OriginalImage = globalThis.Image;

beforeEach(() => {
  mockImageInstances.length = 0;
  globalThis.Image = class MockImage {
    src?: string;
    constructor() {
      mockImageInstances.push(this);
    }
  } as unknown as typeof Image;
});

afterEach(() => {
  globalThis.Image = OriginalImage;
});

describe('AdText', () => {
  const mockAd: AdResponse = {
    adText: 'Check out our amazing product!',
    impUrl: 'https://tracking.example.com/imp',
    clickUrl: 'https://example.com/landing',
    payout: 0.5,
  };

  it('renders ad text when ad is provided', () => {
    render(<AdText ad={mockAd} />);
    expect(screen.getByText('Check out our amazing product!')).toBeInTheDocument();
  });

  it('renders fallback when ad is null', () => {
    render(<AdText ad={null} fallback={<span>Fallback text</span>} />);
    expect(screen.getByText('Fallback text')).toBeInTheDocument();
  });

  it('renders nothing when ad is null and no fallback', () => {
    const { container } = render(<AdText ad={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders as a link when clickUrl is present', () => {
    render(<AdText ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/landing');
  });

  it('renders as span when no clickUrl', () => {
    const adWithoutClick = { ...mockAd, clickUrl: undefined };
    render(<AdText ad={adWithoutClick} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Check out our amazing product!').tagName).toBe('SPAN');
  });

  it('opens link in new tab by default', () => {
    render(<AdText ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored');
  });

  it('opens link in same tab when openInNewTab is false', () => {
    render(<AdText ad={mockAd} openInNewTab={false} />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
    expect(link).toHaveAttribute('rel', 'sponsored');
  });

  it('tracks impression on mount', () => {
    render(<AdText ad={mockAd} />);
    expect(mockImageInstances.length).toBe(1);
    expect(mockImageInstances[0].src).toBe('https://tracking.example.com/imp');
  });

  it('does not track impression when disabled', () => {
    render(<AdText ad={mockAd} disableImpressionTracking />);
    expect(mockImageInstances.length).toBe(0);
  });

  it('calls onImpression callback', () => {
    const onImpression = vi.fn();
    render(<AdText ad={mockAd} onImpression={onImpression} />);
    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<AdText ad={mockAd} onClick={onClick} />);
    
    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClickTracked when clicked', () => {
    const onClickTracked = vi.fn();
    render(<AdText ad={mockAd} onClickTracked={onClickTracked} />);
    
    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(onClickTracked).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<AdText ad={mockAd} className="my-ad-text" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('my-ad-text');
  });

  it('applies custom styles', () => {
    render(<AdText ad={mockAd} style={{ fontWeight: 'bold' }} />);
    const link = screen.getByRole('link');
    expect(link).toHaveStyle({ fontWeight: 'bold' });
  });

  it('applies data-gravity-ad attribute', () => {
    render(<AdText ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-gravity-ad');
  });

  it('inherits color by default', () => {
    render(<AdText ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveStyle({ color: 'inherit' });
  });
});
