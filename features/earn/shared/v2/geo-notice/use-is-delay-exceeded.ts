import { useEffect, useState } from 'react';

/**
 * True once `active` has been continuously true for `delayMs`.
 * Resets as soon as `active` goes false, so a retried query starts over.
 */
export const useIsDelayExceeded = (active: boolean, delayMs: number) => {
  const [isExceeded, setIsExceeded] = useState(false);

  useEffect(() => {
    if (!active) {
      setIsExceeded(false);
      return;
    }

    const timeoutId = setTimeout(() => setIsExceeded(true), delayMs);
    return () => clearTimeout(timeoutId);
  }, [active, delayMs]);

  return isExceeded;
};
