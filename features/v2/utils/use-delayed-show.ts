import { useEffect, useState } from 'react';

const DEFAULT_TIMEOUT_MS = 300;

/**
 * Turns `true` once every loading flag settles, or after `timeoutMs`
 * at the latest, so a slow request never keeps the block hidden.
 * Latches: once shown, it stays shown even if a flag flips back to loading.
 */
export const useDelayedShow = (
  loadings: readonly boolean[],
  timeoutMs = DEFAULT_TIMEOUT_MS,
) => {
  const isLoading = loadings.some(Boolean);
  const [isShown, setIsShown] = useState(!isLoading);

  useEffect(() => {
    if (isShown) return;

    if (!isLoading) {
      setIsShown(true);
      return;
    }

    const timer = setTimeout(() => setIsShown(true), timeoutMs);
    return () => clearTimeout(timer);
  }, [isShown, isLoading, timeoutMs]);

  return isShown;
};
