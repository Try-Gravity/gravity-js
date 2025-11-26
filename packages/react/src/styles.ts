import type { CSSProperties } from 'react';
import type { AdTheme, AdSize } from './types';

/**
 * Base styles for the ad container
 */
export const baseContainerStyle: CSSProperties = {
  display: 'block',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

/**
 * Theme-specific styles
 */
export const themeStyles: Record<AdTheme, CSSProperties> = {
  light: {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    border: '1px solid #e5e5e5',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  dark: {
    backgroundColor: '#1a1a1a',
    color: '#f5f5f5',
    border: '1px solid #333333',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },
  minimal: {
    backgroundColor: 'transparent',
    color: 'inherit',
    border: 'none',
    boxShadow: 'none',
  },
  branded: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
  },
};

/**
 * Size-specific styles
 */
export const sizeStyles: Record<AdSize, CSSProperties> = {
  small: {
    padding: '8px 12px',
    fontSize: '13px',
    lineHeight: '1.4',
    borderRadius: '6px',
  },
  medium: {
    padding: '12px 16px',
    fontSize: '14px',
    lineHeight: '1.5',
    borderRadius: '8px',
  },
  large: {
    padding: '16px 20px',
    fontSize: '16px',
    lineHeight: '1.6',
    borderRadius: '10px',
  },
  responsive: {
    padding: 'clamp(8px, 2vw, 16px) clamp(12px, 3vw, 20px)',
    fontSize: 'clamp(13px, 1.5vw, 16px)',
    lineHeight: '1.5',
    borderRadius: 'clamp(6px, 1vw, 10px)',
  },
};

/**
 * Label styles
 */
export const baseLabelStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  opacity: 0.7,
  marginBottom: '4px',
  display: 'block',
};

/**
 * Hover styles (applied via inline style for simplicity)
 */
export const getHoverTransform = (theme: AdTheme): string => {
  if (theme === 'minimal') return 'none';
  return 'translateY(-1px)';
};

/**
 * Combine styles for a complete ad banner
 */
export function getAdBannerStyles(
  theme: AdTheme,
  size: AdSize,
  customStyles?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number | string;
    style?: CSSProperties;
  }
): CSSProperties {
  const combined: CSSProperties = {
    ...baseContainerStyle,
    ...themeStyles[theme],
    ...sizeStyles[size],
  };

  // Apply custom overrides
  if (customStyles?.backgroundColor) {
    combined.backgroundColor = customStyles.backgroundColor;
  }
  if (customStyles?.textColor) {
    combined.color = customStyles.textColor;
  }
  if (customStyles?.borderRadius !== undefined) {
    combined.borderRadius = customStyles.borderRadius;
  }
  if (customStyles?.style) {
    Object.assign(combined, customStyles.style);
  }

  return combined;
}

