import { useCallback, useEffect, useMemo, useState } from 'react';
import { COWSWAP_WIDGET_LOADING_TIMEOUT_MS } from '../consts';
import { debounce } from 'lodash';
import { useDappStatus } from 'modules/web3';

export const useLoadingStates = () => {
  const { address, chainId } = useDappStatus();
  const [refreshId, setRefreshId] = useState('<INITIAL_UUID>');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setError(null);
      return;
    }
    const timeout = setTimeout(() => {
      setError(new Error('CoW widget loading timed out'));
    }, COWSWAP_WIDGET_LOADING_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (error) {
    throw error;
  }

  // Reset loading state when address or chainId changes
  useEffect(() => {
    return () => {
      setIsLoading((oldLoading) => {
        if (!oldLoading) {
          return true;
        }
        return oldLoading;
      });
    };
  }, [address, chainId]);

  const onLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);
  const onError = useCallback((error: Error) => setError(error), []);

  // Gives widget time to process refresh
  const triggerRefresh = useMemo(
    () => debounce(() => setRefreshId(window.crypto.randomUUID()), 500),
    [],
  );
  return {
    isLoading,
    isLoaded: !isLoading && !error,
    onLoaded,
    onError,
    triggerRefresh,
    refreshId,
  };
};
