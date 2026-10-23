import { useMemo } from 'react';

import { useConfig } from 'config';

import { SWAP_COWSWAP_PROFILE } from '../cowswap';
import { getSwapChainIds } from '../utils';

// swap chains after the manifest switches; stable while the list does not change
export const useSwapChainIds = (): readonly number[] => {
  const { perChain } = useConfig().externalConfig.swap;
  const key = getSwapChainIds(SWAP_COWSWAP_PROFILE.chainIds, perChain).join(
    ',',
  );
  return useMemo(() => (key ? key.split(',').map(Number) : []), [key]);
};
