import React, { useState } from 'react';
import type { AdBannerProps } from '../types';
import { useAdTracking } from '../hooks/useAdTracking';
import { getAdBannerStyles, baseLabelStyle } from '../styles';

/**
 * AdBanner - A customizable component for rendering Gravity AI advertisements
 *
 * @example
 * ```tsx
 * import { AdBanner } from '@gravity-ai/react';
 *
 * function MyComponent() {
 *   const [ad, setAd] = useState(null);
 *
 *   useEffect(() => {
 *     client.getAd({ messages, sessionId, placements }).then(res => setAd(res?.[0] || null));
 *   }, [messages]);
 *
 *   return (
 *     <AdBanner
 *       ad={ad}
 *       theme="dark"
 *       size="medium"
 *       showLabel
 *     />
 *   );
 * }
 * ```
 */
export function AdBanner({
  ad,
  theme = 'light',
  size = 'medium',
  className,
  style,
  textStyle,
  textClassName,
  showLabel = true,
  labelText = 'Sponsored',
  labelStyle,
  onClick,
  onImpression,
  onClickTracked,
  fallback = null,
  disableImpressionTracking = false,
  openInNewTab = true,
  borderRadius,
  backgroundColor,
  textColor,
  accentColor,
}: AdBannerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const { handleClick } = useAdTracking({
    ad,
    disableImpressionTracking,
    onImpression,
    onClickTracked,
  });

  // Return fallback if no ad
  if (!ad) {
    return <>{fallback}</>;
  }

  const containerStyles = getAdBannerStyles(theme, size, {
    backgroundColor,
    textColor,
    borderRadius,
    style,
  });

  // Add hover effect
  if (isHovered && theme !== 'minimal') {
    containerStyles.transform = 'translateY(-1px)';
    containerStyles.boxShadow =
      theme === 'dark'
        ? '0 4px 12px rgba(0, 0, 0, 0.4)'
        : theme === 'branded'
        ? '0 4px 16px rgba(99, 102, 241, 0.4)'
        : '0 4px 12px rgba(0, 0, 0, 0.12)';
  }

  const labelStyles: React.CSSProperties = {
    ...baseLabelStyle,
    color: accentColor || (theme === 'branded' ? 'rgba(255,255,255,0.8)' : undefined),
    ...labelStyle,
  };

  const textStyles: React.CSSProperties = {
    margin: 0,
    ...textStyle,
  };

  const handleClickInternal = (e: React.MouseEvent) => {
    handleClick();
    onClick?.();

    // If no clickUrl, prevent default
    if (!ad.clickUrl) {
      e.preventDefault();
    }
  };

  const linkProps = ad.clickUrl
    ? {
        href: ad.clickUrl,
        target: openInNewTab ? '_blank' : undefined,
        rel: openInNewTab ? 'noopener noreferrer sponsored' : 'sponsored',
      }
    : {};

  return (
    <a
      {...linkProps}
      className={className}
      style={containerStyles}
      onClick={handleClickInternal}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-gravity-ad
    >
      {showLabel && <span style={labelStyles}>{labelText}</span>}
      <p className={textClassName} style={textStyles}>
        {ad.adText}
      </p>
    </a>
  );
}

AdBanner.displayName = 'GravityAdBanner';

