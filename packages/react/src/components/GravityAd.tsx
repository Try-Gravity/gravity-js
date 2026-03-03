import React, { useState } from 'react';
import type { GravityAdProps } from '../types';
import { useAdTracking } from '../hooks/useAdTracking';
import { renderers } from './renderers';
import type { VariantRenderProps } from './renderers';

const FOCUS_STYLE_KEY = '__gravity_ad_focus__';

function injectFocusStyle() {
  if (
    typeof document === 'undefined' ||
    (document as any)[FOCUS_STYLE_KEY]
  ) {
    return;
  }
  (document as any)[FOCUS_STYLE_KEY] = true;
  const s = document.createElement('style');
  s.textContent =
    '[data-gravity-ad]:focus-visible{outline:2px solid #2563EB;outline-offset:2px}';
  document.head.appendChild(s);
}

export function GravityAd({
  ad,
  variant = 'card',
  className,
  style,
  slotProps,
  showLabel = true,
  labelText = 'Sponsored',
  onClick,
  onImpression,
  onClickTracked,
  fallback = null,
  disableImpressionTracking = false,
  openInNewTab = true,
}: GravityAdProps) {
  injectFocusStyle();

  const [hovered, setHovered] = useState(false);

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

  const linkProps = ad.clickUrl
    ? {
        href: ad.clickUrl,
        target: openInNewTab ? ('_blank' as const) : undefined,
        rel: openInNewTab ? 'noopener noreferrer sponsored' : 'sponsored',
      }
    : {};

  const renderProps: VariantRenderProps = {
    ad,
    variant,
    slotProps,
    showLabel,
    labelText,
    hovered,
    setHovered,
    containerRef,
    handleClick: handleClickInternal,
    linkProps,
    className,
    style,
  };

  const render = renderers[variant] || renderers.card;
  return render(renderProps);
}

GravityAd.displayName = 'GravityAd';
