import React from 'react';
import type { AdTextProps } from '../types';
import { useAdTracking } from '../hooks/useAdTracking';

/**
 * Unstyled text-only ad renderer with automatic tracking.
 * Use when you want full control over presentation.
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
  const { containerRef, handleClick } = useAdTracking({
    ad,
    disableImpressionTracking,
    onImpression,
    onClickTracked,
  });

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
        ref={containerRef as React.Ref<HTMLAnchorElement>}
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
    <span
      ref={containerRef as React.Ref<HTMLSpanElement>}
      className={className}
      style={baseStyle}
      data-gravity-ad
    >
      {ad.adText}
    </span>
  );
}

AdText.displayName = 'GravityAdText';
