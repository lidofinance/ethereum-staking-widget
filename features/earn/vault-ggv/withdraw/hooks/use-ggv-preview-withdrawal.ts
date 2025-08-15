import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDappStatus, useLidoSDK } from 'modules/web3';

import { isGGVAvailable } from '../../utils';

import { getGGVQueueContract } from '../../contracts';
import { useDebouncedValue } from 'shared/hooks';

import { useEthUsd } from 'shared/hooks/use-eth-usd';

import type { GGVWithdrawalFormValues } from '../types';
import { useGGVWithdrawForm } from '../form-context';

export const useGGVPreviewWithdrawal = (
  amount?: GGVWithdrawalFormValues['amount'],
) => {
  const { chainId } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { minDiscount } = useGGVWithdrawForm();
  const publicClient = usePublicClient();
  const isEnabled = isGGVAvailable(chainId);

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = amount !== debouncedAmount;

  const query = useQuery({
    queryKey: [
      'ggv',
      'preview-withdrawal',
      {
        amount: debouncedAmount?.toString(),
        minDiscount,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      const queue = getGGVQueueContract(publicClient);

      if (!amount)
        return {
          wsteth: 0n,
          steth: 0n,
        };

      const wstethAddress = await wrap.contractAddressWstETH();
      const wstethAmount = await queue.read.previewAssetsOut([
        wstethAddress,
        amount,
        // for preview we can assume minDiscount will be 1 during short loading time
        minDiscount ?? 1,
      ]);
      const stethAmount = await wrap.convertWstethToSteth(wstethAmount);

      return {
        wsteth: wstethAmount,
        steth: stethAmount,
      };
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
