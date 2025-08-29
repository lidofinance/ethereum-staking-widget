import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDappStatus, useLidoSDK } from 'modules/web3';

import { useDebouncedValue } from 'shared/hooks';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';

import { getGGVQueueContract } from '../../contracts';
import { useGGVAvailable } from '../../hooks/use-ggv-available';
import { useGGVWithdrawForm } from '../form-context';

import type { GGVWithdrawalFormValues } from '../types';

export const useGGVPreviewWithdrawal = (
  amount?: GGVWithdrawalFormValues['amount'],
) => {
  const { isDappActive } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { minDiscount } = useGGVWithdrawForm();
  const publicClient = usePublicClient();
  const { isGGVAvailable } = useGGVAvailable();

  const isEnabled = isDappActive && isGGVAvailable && amount != null;

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = isEnabled && amount !== debouncedAmount;

  const query = useQuery({
    queryKey: [
      'ggv',
      'preview-withdrawal',
      {
        amount: isEnabled ? debouncedAmount?.toString() : null,
        minDiscount,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      const queue = getGGVQueueContract(publicClient);

      if (!debouncedAmount)
        return {
          wsteth: 0n,
        };

      const wstethAddress = await wrap.contractAddressWstETH();
      const wstethAmount = await queue.read.previewAssetsOut([
        wstethAddress,
        debouncedAmount,
        // for preview we can assume minDiscount will be 1 during short loading time
        minDiscount ?? 1,
      ]);

      return {
        wsteth: wstethAmount,
      };
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
