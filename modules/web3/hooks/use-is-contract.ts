import { useCallback } from 'react';
import { useBytecode, usePublicClient } from 'wagmi';

import { useDappStatus } from './use-dapp-status';

import type { Address, Hex } from 'viem';

// helper hook until migration to wagmi is complete
export const useGetIsContract = () => {
  const { chainId } = useDappStatus();
  const client = usePublicClient({ chainId });
  return useCallback(
    async (address: Address) => {
      const code = await client?.getCode({ address });

      return toBool(code);
    },
    [client],
  );
};

const toBool = (data: Hex | undefined) => {
  return !!(data && data != '0x');
};

// helper hook until migration to wagmi is complete
export const useIsContract = (account?: string | null) => {
  const { chainId } = useDappStatus();
  return useBytecode({
    address: account as Address,
    chainId,
    query: {
      enabled: !!account,
      select: toBool,
    },
  });
};
