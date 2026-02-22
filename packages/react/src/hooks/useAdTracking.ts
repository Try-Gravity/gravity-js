import { useEffect, useRef, useCallback } from 'react';
import type { AdResponse } from '../types';

interface UseAdTrackingOptions {
  ad: AdResponse | null;
  disableImpressionTracking?: boolean;
  onImpression?: () => void;
  onClickTracked?: () => void;
}

interface UseAdTrackingReturn {
  containerRef: React.RefObject<HTMLElement | null>;
  handleClick: () => void;
  impressionFired: boolean;
}

export function useAdTracking({
  ad,
  disableImpressionTracking = false,
  onImpression,
  onClickTracked,
}: UseAdTrackingOptions): UseAdTrackingReturn {
  const containerRef = useRef<HTMLElement | null>(null);
  const impressionFired = useRef(false);
  const impUrlRef = useRef(ad?.impUrl);

  // Reset when the ad's impression URL changes (new ad served)
  useEffect(() => {
    if (ad?.impUrl !== impUrlRef.current) {
      impressionFired.current = false;
      impUrlRef.current = ad?.impUrl;
    }
  }, [ad?.impUrl]);

  useEffect(() => {
    if (!ad?.impUrl || disableImpressionTracking || impressionFired.current) {
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      // Fallback for environments without IntersectionObserver (e.g. SSR hydration,
      // older browsers): fire immediately like the old behavior.
      fireImpression(ad.impUrl, impressionFired, onImpression);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionFired.current && ad.impUrl) {
            fireImpression(ad.impUrl, impressionFired, onImpression);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [ad, disableImpressionTracking, onImpression]);

  const handleClick = useCallback(() => {
    if (!ad?.clickUrl) return;
    onClickTracked?.();
  }, [ad?.clickUrl, onClickTracked]);

  return {
    containerRef,
    handleClick,
    impressionFired: impressionFired.current,
  };
}

function fireImpression(
  impUrl: string,
  firedRef: React.MutableRefObject<boolean>,
  onImpression?: () => void,
) {
  try {
    const img = new Image();
    img.src = impUrl;
    firedRef.current = true;
    onImpression?.();
  } catch {
    // Silently fail -- don't break the host app for tracking failures
  }
}
