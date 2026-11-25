import { isSupportedL1Chain } from 'consts/chains';
import type { ManifestConfig } from 'config/external-config';

// profile chains minus L2s turned off in the manifest; L1 is switched by the swap page flag
export const getSwapChainIds = (
  profileChainIds: readonly number[],
  perChain: ManifestConfig['swap']['perChain'],
): number[] =>
  profileChainIds.filter(
    (chainId) =>
      isSupportedL1Chain(chainId) || perChain[chainId]?.enabled !== false,
  );
