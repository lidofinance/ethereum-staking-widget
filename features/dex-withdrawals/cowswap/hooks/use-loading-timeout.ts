import { useEffect, useState } from 'react';
import { COWSWAP_WIDGET_LOADING_TIMEOUT_MS } from '../consts';

export const useLoadingTimeout = (isLoading: boolean) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }
    const timeout = setTimeout(() => {
      setHasTimedOut(true);
    }, COWSWAP_WIDGET_LOADING_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (hasTimedOut && isLoading) {
    throw new Error('CoW widget loading timed out');
  }
};
