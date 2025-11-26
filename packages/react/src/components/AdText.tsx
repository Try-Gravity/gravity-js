import React from 'react';
import type { AdTextProps } from '../types';
import { useAdTracking } from '../hooks/useAdTracking';

/**
 * AdText - A minimal text-only component for rendering Gravity AI advertisements
 *
 * Use this when you want full control over styling and just need the ad text
 * with automatic tracking.
 *
 * @example
 * ```tsx
 * import { AdText } from '@gravity-ai/react';
 *
 * function MyComponent() {
 *   return (
 *     <AdText
 *       ad={ad}
 *       className="my-custom-ad-style"
 *     />
 *   );
 * }
 * ```
 */
export function AdText({
  ad,
  className,
  style,
  onClick,
  onImpression,
  onClickTracked,
  fallback = null,
  disableImpressionTracking = false,
  openInNewTab = true,
}: AdTextProps) {
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

  const handleClickInternal = (e: React.MouseEvent) => {
    handleClick();
    onClick?.();

    if (!ad.clickUrl) {
      e.preventDefault();
    }
  };

  const baseStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: 'inherit',
    cursor: ad.clickUrl ? 'pointer' : 'default',
    ...style,
  };

  if (ad.clickUrl) {
    return (
      <a
        href={ad.clickUrl}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer sponsored' : 'sponsored'}
        className={className}
        style={baseStyle}
        onClick={handleClickInternal}
        data-gravity-ad
      >
        {ad.adText}
      </a>
    );
  }

  return (
    <span className={className} style={baseStyle} data-gravity-ad>
      {ad.adText}
    </span>
  );
}

AdText.displayName = 'GravityAdText';

