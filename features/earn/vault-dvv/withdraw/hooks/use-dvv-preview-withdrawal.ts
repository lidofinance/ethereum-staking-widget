import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDVVAvailable } from '../../hooks/use-dvv-avaliable';
import { getDVVVaultContract } from '../../contracts';
import { useLidoSDK } from 'modules/web3/web3-provider/lido-sdk';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

export const useDVVPreviewWithdrawal = (amount?: bigint | null) => {
  const publicClient = usePublicClient();
  const { wrap } = useLidoSDK();
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
          steth: 0n,
        };

      const wstethAmount = await vault.read.previewRedeem([debouncedAmount]);
      const stethAmount = await wrap.convertWstethToSteth(wstethAmount);

      return { wsteth: wstethAmount, steth: stethAmount };
    },
  });

  const usdQuery = useEthUsd(query.data?.steth);

  return {
    isLoading: isDebounced || query.isLoading || usdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      steth: query.data?.steth,
      usd: usdQuery.usdAmount,
    },
  };
};
