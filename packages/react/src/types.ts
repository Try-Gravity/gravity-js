import type { CSSProperties, ReactNode } from 'react';

export interface AdResponse {
  adText: string;
  title?: string;
  cta?: string;
  brandName?: string;
  url?: string;
  favicon?: string;
  impUrl?: string;
  clickUrl?: string;
}

export type GravityAdVariant =
  | 'card' | 'inline' | 'minimal'
  | 'bubble' | 'contextual' | 'native' | 'footnote' | 'quote' | 'suggestion'
  | 'accent' | 'side-panel' | 'labeled' | 'spotlight' | 'embed' | 'split-action'
  | 'pill' | 'banner' | 'divider' | 'toolbar'
  | 'tooltip' | 'notification';

/**
 * Style + className overrides for individual elements inside `<GravityAd />`.
 *
 * Each key maps 1:1 to a DOM element in the component's JSX tree.
 * Pass `style` to merge onto the element's inline styles, or `className`
 * to append a CSS class.
 */
export interface GravityAdSlotProps {
  /** Outer `<a>` wrapper (same as the top-level `style`/`className` props) */
  container?: { style?: CSSProperties; className?: string };
  /** Inner padding/layout wrapper */
  inner?: { style?: CSSProperties; className?: string };
  /** Header row (favicon + brand + label) */
  header?: { style?: CSSProperties; className?: string };
  /** Favicon `<img>` */
  favicon?: { style?: CSSProperties; className?: string };
  /** Brand name `<span>` */
  brand?: { style?: CSSProperties; className?: string };
  /** "Sponsored" label `<span>` */
  label?: { style?: CSSProperties; className?: string };
  /** Body wrapper (title + text) */
  body?: { style?: CSSProperties; className?: string };
  /** Title `<p>` */
  title?: { style?: CSSProperties; className?: string };
  /** Ad text `<p>` */
  text?: { style?: CSSProperties; className?: string };
  /** CTA button `<span>` */
  cta?: { style?: CSSProperties; className?: string };

  // Variant-specific slots

  /** Icon wrapper (larger background container around favicon) */
  iconWrapper?: { style?: CSSProperties; className?: string };
  /** Colored accent bar (top of `accent` variant) */
  accentBar?: { style?: CSSProperties; className?: string };
  /** Secondary CTA (`split-action` variant) */
  secondaryCta?: { style?: CSSProperties; className?: string };
  /** Footer area */
  footer?: { style?: CSSProperties; className?: string };
  /** Tooltip arrow element */
  arrow?: { style?: CSSProperties; className?: string };
  /** Context header text (`contextual` variant) */
  contextHeader?: { style?: CSSProperties; className?: string };
}

export interface GravityAdProps {
  ad: AdResponse | null;
  variant?: GravityAdVariant;
  className?: string;
  style?: CSSProperties;
  /** Targeted style overrides for inner elements. */
  slotProps?: GravityAdSlotProps;
  showLabel?: boolean;
  labelText?: string;
  onClick?: () => void;
  onImpression?: () => void;
  onClickTracked?: () => void;
  fallback?: ReactNode;
  disableImpressionTracking?: boolean;
  openInNewTab?: boolean;
}

export interface AdTextProps {
  ad: AdResponse | null;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  onImpression?: () => void;
  onClickTracked?: () => void;
  fallback?: ReactNode;
  disableImpressionTracking?: boolean;
  openInNewTab?: boolean;
}
