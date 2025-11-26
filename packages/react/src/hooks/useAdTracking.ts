import { useEffect, useRef, useCallback } from 'react';
import type { AdResponse } from '../types';

interface UseAdTrackingOptions {
  ad: AdResponse | null;
  disableImpressionTracking?: boolean;
  onImpression?: () => void;
  onClickTracked?: () => void;
}

/**
 * Hook to handle ad impression and click tracking
 */
export function useAdTracking({
  ad,
  disableImpressionTracking = false,
  onImpression,
  onClickTracked,
}: UseAdTrackingOptions) {
  const impressionTracked = useRef(false);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (!ad || !ad.impUrl || disableImpressionTracking || impressionTracked.current) {
      return;
    }

    // Fire impression pixel
    const trackImpression = async () => {
      try {
        // Use an image beacon for reliable tracking
        const img = new Image();
        img.src = ad.impUrl!;
        impressionTracked.current = true;
        onImpression?.();
      } catch (error) {
        console.error('[Gravity] Failed to track impression:', error);
      }
    };

    trackImpression();
  }, [ad, disableImpressionTracking, onImpression]);

  // Reset impression tracking when ad changes
  useEffect(() => {
    impressionTracked.current = false;
  }, [ad?.impUrl]);

  // Handle click tracking
  const handleClick = useCallback(() => {
    if (!ad?.clickUrl) return;

    // Fire click tracking (the actual navigation is handled separately)
    onClickTracked?.();
  }, [ad?.clickUrl, onClickTracked]);

  return {
    handleClick,
    impressionTracked: impressionTracked.current,
  };
}

