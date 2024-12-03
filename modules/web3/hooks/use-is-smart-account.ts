import { useBytecode } from 'wagmi';

import { useDappStatus } from './use-dapp-status';
import { useAA } from './use-aa';

import type { Address, Hex } from 'viem';

const toBool = (data: Hex | undefined) => {
  return !!(data && data != '0x');
};

export const useIsSmartAccount = () => {
  const { address, chainId } = useDappStatus();
  const {
    isAA,
    capabilities,
    isLoading: isAALoading,
    error: isAAError,
  } = useAA();

  const shouldLegacyFetch = !!address && !isAA;

  // pre-eip5792
  const {
    data: isContract,
    isLoading: isContractLoading,
    error: isContractError,
  } = useBytecode({
    address: address as Address,
    chainId,
    query: {
      enabled: shouldLegacyFetch,
      select: toBool,
    },
  });

  return {
    isAA,
    capabilities,
    isSmartAccount: isAA || isContract,
    // prevents legacy logic from polluting state
    isLoading: isContractLoading || (shouldLegacyFetch && isAALoading),
    error: isAAError || (shouldLegacyFetch ? isContractError : undefined),
  };
};
