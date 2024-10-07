import { useCallback } from 'react';
import type { Address, Hex } from 'viem';

import { useBytecode, usePublicClient } from 'wagmi';

// helper hook until migration to wagmi is complete
export const useGetIsContract = () => {
  const client = usePublicClient();
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
  return useBytecode({
    address: account as Address,
    query: {
      enabled: !!account,
      select: toBool,
    },
  });
};
