import { useBytecode } from 'wagmi';

import { useDappStatus } from './use-dapp-status';
import { useAA } from './use-aa';

import type { Address, Hex } from 'viem';

const isDelegatedEOA = (data: Hex | undefined) =>
  Boolean(data?.startsWith('0xef0100'));
const isEOA = (data: Hex | undefined) => Boolean(data === '0x');

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
    data: hasBytecode,
    isLoading: isContractLoading,
    error: isContractError,
  } = useBytecode({
    address: address as Address,
    chainId,
    query: {
      enabled: shouldLegacyFetch,
      select: (data: Hex | undefined) =>
        // true if the address has some bytecode, but is not an EOA or a delegated EOA
        Boolean(data && !isEOA(data) && !isDelegatedEOA(data)),
    },
  });

  return {
    isAA,
    hasBytecode,
    isSmartAccount: isAA || hasBytecode,
    capabilities,
    // prevents legacy logic from polluting state
    isLoading: isContractLoading || (shouldLegacyFetch && isAALoading),
    error: isAAError || (shouldLegacyFetch ? isContractError : undefined),
  };
};
