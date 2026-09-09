import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { getWithdrawQuoteQueryOptions } from '../quotes/withdraw-quote';
import {
  CollectorContract,
  AsyncRedeemQueueContract,
  SyncRedeemQueueContract,
} from '../types/contracts';
import { TOKENS, type Token } from 'consts/tokens';

export type { WithdrawParams } from '../quotes/withdraw-quote';

type UsePreviewWithdrawArgs = {
  redeemQueue: AsyncRedeemQueueContract;
  syncRedeemQueue?: SyncRedeemQueueContract;
  redeemQueueToken: Token;
  collector: CollectorContract;
  shares: bigint | null | undefined;
};

export const usePreviewWithdraw = ({
  redeemQueue,
  syncRedeemQueue,
  redeemQueueToken,
  collector,
  shares,
}: UsePreviewWithdrawArgs) => {
  const { isDappActive } = useDappStatus();

  const isEnabled = isDappActive && shares != null;

  const debouncedStrethShares = useDebouncedValue(shares, 500);
  const isDebounced = isEnabled && shares !== debouncedStrethShares;

  // Same query options as the withdraw hook re-fetches before signing (see verifyQuote)
  const query = useQuery({
    ...getWithdrawQuoteQueryOptions({
      collector,
      asyncRedeemQueue: redeemQueue,
      syncRedeemQueue,
      shares: debouncedStrethShares,
    }),
    enabled: isEnabled,
  });

  // Actual if redeeming wstETH
  const wstethUsdQuery = useWstethUsd(query.data?.assets ?? 0n);

  const usd =
    redeemQueueToken === TOKENS.wsteth ? wstethUsdQuery.usdAmount : undefined;

  return {
    isLoading: isDebounced || query.isLoading || wstethUsdQuery.isLoading,
    data: {
      assets: query.data?.assets,
      route: query.data?.route,
      penaltyD6: query.data?.penaltyD6,
      usd,
    },
  };
};
