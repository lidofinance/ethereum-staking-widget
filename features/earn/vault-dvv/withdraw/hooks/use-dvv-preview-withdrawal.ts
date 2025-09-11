import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDappStatus } from 'modules/web3';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';

import { useDVVAvailable } from '../../hooks/use-dvv-available';
import { getDVVVaultContract } from '../../contracts';

export const useDVVPreviewWithdrawal = (amount?: bigint | null) => {
  const publicClient = usePublicClient();
  const { isDappActive } = useDappStatus();
  const { isDVVAvailable } = useDVVAvailable();

  const isEnabled = isDappActive && isDVVAvailable && amount != null;

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = isEnabled && amount !== debouncedAmount;

  const query = useQuery({
    queryKey: [
      'dvv',
      'preview-withdrawal',
      {
        amount: isEnabled ? debouncedAmount?.toString() : null,
      },
    ] as const,
    enabled: isEnabled,
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
      eth: usdQuery.ethAmount,
    },
  };
};
