import { useCallback, useEffect, useMemo, useState } from 'react';
import { COWSWAP_WIDGET_LOADING_TIMEOUT_MS } from '../consts';
import { debounce, uniqueId } from 'lodash';
import { useDappStatus } from 'modules/web3';

// widgetKey changes whenever the widget is recreated without a remount, e.g. the provider
export const useLoadingStates = (widgetKey: unknown) => {
  const { address, chainId } = useDappStatus();
  // Refresh ID is used to trigger a refresh of the widget state even when they params change
  const [refreshId, setRefreshId] = useState('<INITIAL_HYDRATION_SAFE_UUID>');
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

  if (error) throw error;

  // Reset loading state when the widget is recreated: READY fires once per widget.
  // Not on the wallet chain alone: a provider that stays undefined recreates nothing.
  // Works specifically on clean up to avoid race conditions on first load
  useEffect(() => {
    return () => setIsLoading(true);
  }, [address, chainId, widgetKey]);

  const onLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);
  const onError = useCallback((error: Error) => setError(error), []);

  // Gives widget time to process refresh
  const triggerRefresh = useMemo(
    () => debounce(() => setRefreshId(uniqueId('cow-refresh-')), 500),
    [],
  );
  useEffect(() => () => triggerRefresh.cancel(), [triggerRefresh]);

  return {
    isLoading,
    isLoaded: !isLoading && !error,
    onLoaded,
    onError,
    triggerRefresh,
    refreshId,
  };
};
