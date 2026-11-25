import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import { readWithdrawQuote, type VaultQuote } from '../utils/quote';
import {
  CollectorContract,
  AsyncRedeemQueueContract,
} from '../types/contracts';
import { TOKENS, type Token } from 'consts/tokens';

type UsePreviewWithdrawArgs = {
  redeemQueue: AsyncRedeemQueueContract;
  redeemQueueToken: Token;
  collector: CollectorContract;
  shares: bigint | null | undefined;
};

export const usePreviewWithdraw = ({
  redeemQueue,
  redeemQueueToken,
  collector,
  shares,
}: UsePreviewWithdrawArgs) => {
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
    queryFn: async (): Promise<VaultQuote> => {
      invariant(userAddress, 'User address is not available');

      if (!debouncedStrethShares) return { amountIn: 0n, amountOut: 0n };

      return readWithdrawQuote({
        collector,
        redeemQueue,
        shares: debouncedStrethShares,
      });
    },
  });

  // Actual if redeeming wstETH
  const wstethUsdQuery = useWstethUsd(query.data?.amountOut ?? 0n);

  const usd =
    redeemQueueToken === TOKENS.wsteth ? wstethUsdQuery.usdAmount : undefined;

  return {
    isLoading: isDebounced || query.isLoading || wstethUsdQuery.isLoading,
    data: {
      assets: query.data?.amountOut,
      usd,
    },
    // the displayed quote and its refetch: a withdrawal is held to it
    quote: query.data,
    refetchQuote: query.refetch,
  };
};
