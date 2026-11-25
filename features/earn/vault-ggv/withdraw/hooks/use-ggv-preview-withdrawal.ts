import invariant from 'tiny-invariant';
import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { useDappStatus, useLidoSDK } from 'modules/web3';

import { useDebouncedValue } from 'shared/hooks';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

import { getGGVQueueContract } from '../../contracts';
import { useGGVAvailable } from '../../hooks/use-ggv-available';
import { getGGVAssetsOut } from '../../utils';
import { useGGVWithdrawForm } from '../form-context';

import type { GGVWithdrawalFormValues } from '../types';

export const useGGVPreviewWithdrawal = (
  amount?: GGVWithdrawalFormValues['amount'],
) => {
  const { isDappActive } = useDappStatus();
  const { wrap } = useLidoSDK();
  const { minDiscount, isBulkWithdraw, bulkRate, shareDecimals, reason } =
    useGGVWithdrawForm();
  const publicClient = usePublicClient();
  const { isGGVAvailable } = useGGVAvailable();

  const isEnabled = isDappActive && isGGVAvailable && amount != null;

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = isEnabled && amount !== debouncedAmount;

  // Queue mode: wstETH through the queue preview
  const query = useQuery({
    queryKey: [
      'ggv',
      'preview-withdrawal',
      {
        amount: isEnabled ? debouncedAmount?.toString() : null,
        minDiscount,
      },
    ] as const,
    enabled: isEnabled && !isBulkWithdraw,
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

  // Bulk mode: WETH by the accountant rate, same math as the Teller
  const bulkAssets =
    isBulkWithdraw && isEnabled && bulkRate != null && shareDecimals != null
      ? getGGVAssetsOut(debouncedAmount ?? 0n, bulkRate, shareDecimals)
      : undefined;

  const wstethUsdQuery = useWstethUsd(
    isBulkWithdraw ? undefined : query.data?.wsteth,
  );
  const ethUsdQuery = useEthUsd(bulkAssets);

  if (isBulkWithdraw) {
    return {
      isLoading:
        isDebounced ||
        // Null rate means the accountant is paused. Then there is no preview.
        // A failed state read gives no rate too. Do not wait for it.
        (isEnabled &&
          bulkRate === undefined &&
          reason !== 'state-unavailable') ||
        ethUsdQuery.isLoading,
      data: {
        assets: bulkAssets,
        usd: ethUsdQuery.usdAmount,
        eth: undefined,
      },
    };
  }

  return {
    isLoading: isDebounced || query.isLoading || wstethUsdQuery.isLoading,
    data: {
      assets: query.data?.wsteth,
      usd: wstethUsdQuery.usdAmount,
      eth: wstethUsdQuery.ethAmount,
    },
  };
};
