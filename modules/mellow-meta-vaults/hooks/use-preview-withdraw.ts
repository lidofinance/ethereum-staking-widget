import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { COLLECTOR_CONFIG, QUERY_KEY } from '../consts';
import { CollectorContract, RedeemQueueContract } from '../types/contracts';

export type WithdrawParams = {
  assets: bigint;
};

export const usePreviewWithdraw = ({
  redeemQueue,
  collector,
  shares,
}: {
  redeemQueue: RedeemQueueContract;
  collector: CollectorContract;
  shares: bigint | null | undefined;
}) => {
  const { isDappActive, address: userAddress } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && shares != null;

  const debouncedStrethShares = useDebouncedValue(shares, 500);
  const isDebounced = isEnabled && shares !== debouncedStrethShares;

  const query = useQuery({
    queryKey: [
      QUERY_KEY,
      'preview-widthdraw',
      collector.address,
      redeemQueue.address,
      {
        amount: isEnabled ? debouncedStrethShares?.toString() : null,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');
      invariant(userAddress, 'User address is not available');

      if (!debouncedStrethShares)
        return {
          wsteth: 0n,
        };

      const { assets: wsteth } = (await collector.read.getWithdrawalParams([
        debouncedStrethShares,
        redeemQueue.address,
        COLLECTOR_CONFIG,
      ])) as WithdrawParams;

      return {
        wsteth,
      };
    },
  });

  const wstethUsdQuery = useWstethUsd(query.data?.wsteth ?? 0n);

  return {
    isLoading: isDebounced || query.isLoading || wstethUsdQuery.isLoading,
    data: {
      wsteth: query.data?.wsteth,
      usd: wstethUsdQuery.usdAmount,
    },
  };
};
