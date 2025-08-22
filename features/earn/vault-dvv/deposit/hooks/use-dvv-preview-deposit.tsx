import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useLidoSDK } from 'modules/web3';
import { useDebouncedValue } from 'shared/hooks';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

import { getDVVVaultContract } from '../../contracts';
import { useDVVAvailable } from '../../hooks/use-dvv-avaliable';
import type { DVVDepositFormValues } from '../types';

export const useDVVPreviewDeposit = (
  amount?: DVVDepositFormValues['amount'],
) => {
  const publicClient = usePublicClient();
  const { isDVVAvailable } = useDVVAvailable();
  const { wrap } = useLidoSDK();

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = amount !== debouncedAmount;

  const query = useQuery({
    queryKey: [
      'dvv',
      'preview-deposit',
      {
        amount: debouncedAmount?.toString(),
      },
    ] as const,
    enabled: isDVVAvailable,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');

      const vault = getDVVVaultContract(publicClient);

      if (!amount)
        return {
          shares: 0n,
          wsteth: 0n,
        };

      const wsteth = await wrap.convertStethToWsteth(amount);
      const shares = await vault.read.previewDeposit([wsteth]);

      return {
        shares,
        wsteth,
      };
    },
  });

  const usdQuery = useWstethUsd(query.data?.wsteth);

  return {
    isLoading: isDebounced || query.isLoading || usdQuery.isLoading,
    data: {
      shares: query.data?.shares,
      wsteth: query.data?.wsteth,
      usd: usdQuery.usdAmount,
    },
  };
};
