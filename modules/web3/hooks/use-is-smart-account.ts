import { useBytecode } from 'wagmi';

import { useDappStatus } from './use-dapp-status';
import { useAA } from './use-aa';

import type { Address, Hex } from 'viem';

const isDelegatedEOA = (data: Hex | undefined) =>
  Boolean(data?.startsWith('0xef0100'));
const isEOA = (data: Hex | undefined) => Boolean(data === '0x');

// true if the address has some bytecode, but is not an EOA or a delegated EOA
const processData = (data: Hex | undefined) =>
  Boolean(data && !isEOA(data) && !isDelegatedEOA(data));

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
    data: isContract, // see processData
    isLoading: isContractLoading,
    error: isContractError,
  } = useBytecode({
    address: address as Address,
    chainId,
    query: {
      enabled: shouldLegacyFetch,
      select: processData,
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
