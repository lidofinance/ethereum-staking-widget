import { QueryClient } from '@tanstack/react-query';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { bigIntHashKey } from 'utils/bn-int-hash-key';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: bigIntHashKey,
      ...STRATEGY_LAZY,
    },
  },
});

// polling a working wallet client only swaps the object and recreates the SDK and the CoW widget; a failed one is still retried
queryClient.setQueryDefaults(['walletClient'], {
  refetchInterval: (query) =>
    query.state.status === 'error' ? STRATEGY_LAZY.refetchInterval : false,
});
