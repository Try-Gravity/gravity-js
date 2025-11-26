import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdBanner } from './AdBanner';
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

describe('AdBanner', () => {
  const mockAd: AdResponse = {
    adText: 'Check out our amazing product!',
    impUrl: 'https://tracking.example.com/imp',
    clickUrl: 'https://example.com/landing',
    payout: 0.5,
  };

  it('renders ad text when ad is provided', () => {
    render(<AdBanner ad={mockAd} />);
    expect(screen.getByText('Check out our amazing product!')).toBeInTheDocument();
  });

  it('renders fallback when ad is null', () => {
    render(<AdBanner ad={null} fallback={<div>No ad available</div>} />);
    expect(screen.getByText('No ad available')).toBeInTheDocument();
  });

  it('renders nothing when ad is null and no fallback', () => {
    const { container } = render(<AdBanner ad={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows sponsored label by default', () => {
    render(<AdBanner ad={mockAd} />);
    expect(screen.getByText('Sponsored')).toBeInTheDocument();
  });

  it('hides sponsored label when showLabel is false', () => {
    render(<AdBanner ad={mockAd} showLabel={false} />);
    expect(screen.queryByText('Sponsored')).not.toBeInTheDocument();
  });

  it('uses custom label text', () => {
    render(<AdBanner ad={mockAd} labelText="Advertisement" />);
    expect(screen.getByText('Advertisement')).toBeInTheDocument();
  });

  it('renders as a link when clickUrl is present', () => {
    render(<AdBanner ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/landing');
  });

  it('opens link in new tab by default', () => {
    render(<AdBanner ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer sponsored');
  });

  it('opens link in same tab when openInNewTab is false', () => {
    render(<AdBanner ad={mockAd} openInNewTab={false} />);
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target');
    expect(link).toHaveAttribute('rel', 'sponsored');
  });

  it('tracks impression on mount', () => {
    render(<AdBanner ad={mockAd} />);
    expect(mockImageInstances.length).toBe(1);
    expect(mockImageInstances[0].src).toBe('https://tracking.example.com/imp');
  });

  it('does not track impression when disabled', () => {
    render(<AdBanner ad={mockAd} disableImpressionTracking />);
    expect(mockImageInstances.length).toBe(0);
  });

  it('does not track impression when no impUrl', () => {
    const adWithoutImp = { ...mockAd, impUrl: undefined };
    render(<AdBanner ad={adWithoutImp} />);
    expect(mockImageInstances.length).toBe(0);
  });

  it('calls onImpression callback when impression fires', () => {
    const onImpression = vi.fn();
    render(<AdBanner ad={mockAd} onImpression={onImpression} />);
    expect(onImpression).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when banner is clicked', () => {
    const onClick = vi.fn();
    render(<AdBanner ad={mockAd} onClick={onClick} />);
    
    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClickTracked when banner is clicked', () => {
    const onClickTracked = vi.fn();
    render(<AdBanner ad={mockAd} onClickTracked={onClickTracked} />);
    
    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(onClickTracked).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<AdBanner ad={mockAd} className="custom-class" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-class');
  });

  it('applies data-gravity-ad attribute', () => {
    render(<AdBanner ad={mockAd} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('data-gravity-ad');
  });

  describe('themes', () => {
    it('applies light theme styles', () => {
      render(<AdBanner ad={mockAd} theme="light" />);
      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ backgroundColor: '#ffffff' });
    });

    it('applies dark theme styles', () => {
      render(<AdBanner ad={mockAd} theme="dark" />);
      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ backgroundColor: '#1a1a1a' });
    });

    it('applies branded theme styles', () => {
      render(<AdBanner ad={mockAd} theme="branded" />);
      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ backgroundColor: '#6366f1' });
    });

    it('applies minimal theme styles', () => {
      render(<AdBanner ad={mockAd} theme="minimal" />);
      const link = screen.getByRole('link');
      // Minimal theme has no border/shadow
      expect(link).toHaveStyle({ border: 'none', boxShadow: 'none' });
    });
  });

  describe('custom styling', () => {
    it('applies custom backgroundColor', () => {
      render(<AdBanner ad={mockAd} backgroundColor="#ff0000" />);
      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('applies custom textColor', () => {
      render(<AdBanner ad={mockAd} textColor="#00ff00" />);
      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ color: '#00ff00' });
    });

    it('applies custom borderRadius', () => {
      render(<AdBanner ad={mockAd} borderRadius={20} />);
      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ borderRadius: '20px' });
    });
  });
});
