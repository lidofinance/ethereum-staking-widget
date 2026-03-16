import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { COLLECTOR_CONFIG, MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import { CollectorContract, RedeemQueueContract } from '../types/contracts';
import { TOKENS, type Token } from 'consts/tokens';

export type WithdrawParams = {
  assets: bigint; // e.g. wstETH or USDC amount to receive from redeeming the shares
};

export const usePreviewWithdraw = ({
  redeemQueue,
  redeemQueueToken,
  collector,
  shares,
}: {
  redeemQueue: RedeemQueueContract;
  redeemQueueToken: Token;
  collector: CollectorContract;
  shares: bigint | null | undefined;
}) => {
  const { isDappActive, address: userAddress } = useDappStatus();

  const isEnabled = isDappActive && shares != null;

  const debouncedStrethShares = useDebouncedValue(shares, 500);
  const isDebounced = isEnabled && shares !== debouncedStrethShares;

  const query = useQuery({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      'preview-widthdraw',
      collector.address,
      redeemQueue.address,
      {
        amount: isEnabled ? debouncedStrethShares?.toString() : null,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async () => {
      invariant(userAddress, 'User address is not available');

      if (!debouncedStrethShares)
        return {
          assets: 0n,
        };

      const { assets } = (await collector.read.getWithdrawalParams([
        debouncedStrethShares,
        redeemQueue.address,
        COLLECTOR_CONFIG,
      ])) as WithdrawParams;

      return {
        assets,
      };
    },
  });

  // Actual if redeeming wstETH
  const wstethUsdQuery = useWstethUsd(query.data?.assets ?? 0n);

  const usd =
    redeemQueueToken === TOKENS.wsteth ? wstethUsdQuery.usdAmount : undefined;

  return {
    isLoading: isDebounced || query.isLoading || wstethUsdQuery.isLoading,
    data: {
      assets: query.data?.assets,
      usd,
    },
  };
};
