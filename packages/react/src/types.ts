import type { CSSProperties, ReactNode } from 'react';

/**
 * Ad response from the Gravity API
 * This mirrors the type from @gravity-ai/api for convenience
 */
export interface AdResponse {
  adText: string;
  impUrl?: string;
  clickUrl?: string;
  payout?: number;
}

/**
 * Visual theme presets for the ad banner
 */
export type AdTheme = 'light' | 'dark' | 'minimal' | 'branded';

/**
 * Banner size presets
 */
export type AdSize = 'small' | 'medium' | 'large' | 'responsive';

/**
 * Props for the AdBanner component
 */
export interface AdBannerProps {
  /** The ad response from Gravity API */
  ad: AdResponse | null;

  /** Visual theme preset */
  theme?: AdTheme;

  /** Size preset */
  size?: AdSize;

  /** Custom class name for the container */
  className?: string;

  /** Custom inline styles for the container */
  style?: CSSProperties;

  /** Custom styles for the ad text */
  textStyle?: CSSProperties;

  /** Custom class name for the ad text */
  textClassName?: string;

  /** Whether to show the "Sponsored" label */
  showLabel?: boolean;

  /** Custom label text (default: "Sponsored") */
  labelText?: string;

  /** Custom styles for the label */
  labelStyle?: CSSProperties;

  /** Custom click handler (called in addition to tracking) */
  onClick?: () => void;

  /** Callback when impression is tracked */
  onImpression?: () => void;

  /** Callback when click is tracked */
  onClickTracked?: () => void;

  /** Custom content to render when ad is null */
  fallback?: ReactNode;

  /** Whether to disable automatic impression tracking */
  disableImpressionTracking?: boolean;

  /** Whether to open link in new tab (default: true) */
  openInNewTab?: boolean;

  /** Custom border radius */
  borderRadius?: number | string;

  /** Custom background color (overrides theme) */
  backgroundColor?: string;

  /** Custom text color (overrides theme) */
  textColor?: string;

  /** Custom accent/brand color */
  accentColor?: string;
}

/**
 * Props for the AdText component (minimal text-only rendering)
 */
export interface AdTextProps {
  /** The ad response from Gravity API */
  ad: AdResponse | null;

  /** Custom class name */
  className?: string;

  /** Custom inline styles */
  style?: CSSProperties;

  /** Custom click handler */
  onClick?: () => void;

  /** Callback when impression is tracked */
  onImpression?: () => void;

  /** Callback when click is tracked */
  onClickTracked?: () => void;

  /** Content to render when ad is null */
  fallback?: ReactNode;

  /** Whether to disable automatic impression tracking */
  disableImpressionTracking?: boolean;

  /** Whether to open link in new tab (default: true) */
  openInNewTab?: boolean;
}

