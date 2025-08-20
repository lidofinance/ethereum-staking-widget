import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDVVAvailable } from '../../hooks/use-dvv-avaliable';
import { getDVVVaultContract } from '../../contracts';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

export const useDVVPreviewWithdrawal = (amount?: bigint | null) => {
  const publicClient = usePublicClient();
  const { isDVVAvailable } = useDVVAvailable();

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = amount !== debouncedAmount;

  const query = useQuery({
    queryKey: [
      'dvv',
      'preview-withdrawal',
      {
        amount: debouncedAmount?.toString(),
      },
    ] as const,
    enabled: isDVVAvailable,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      const vault = getDVVVaultContract(publicClient);

      if (!debouncedAmount)
        return {
          wsteth: 0n,
        };

      const wstethAmount = await vault.read.previewRedeem([debouncedAmount]);

      return { wsteth: wstethAmount };
    },
  });

  const usdQuery = useWstethUsd(query.data?.wsteth);

  return {
    isLoading: isDebounced || query.isLoading || usdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      usd: usdQuery.usdAmount,
    },
  };
};
