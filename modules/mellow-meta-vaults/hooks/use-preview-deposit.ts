import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useStETHByWstETH } from 'modules/web3/hooks/use-stETH-by-wstETH';
import { TOKENS } from 'consts/tokens';
import { getDepositQuoteQueryOptions } from '../quotes/deposit-quote';
import { CollectorContract, DepositQueueContract } from '../types/contracts';

export type { DepositParams } from '../quotes/deposit-quote';

type UsePreviewDepositArgs<DepositToken extends string> = {
  depositQueue: DepositQueueContract;
  collector: CollectorContract;
  amount?: bigint | null;
  token?: DepositToken;
};

export const usePreviewDeposit = <DepositToken extends string>({
  depositQueue,
  collector,
  amount,
  token,
}: UsePreviewDepositArgs<DepositToken>) => {
  const { isDappActive, address: userAddress } = useDappStatus();

  const isEnabled = isDappActive && amount != null;

  const debouncedAmount = useDebouncedValue(amount, 500);
  const isDebounced = isEnabled && amount !== debouncedAmount;

  // Same query options as the deposit hook re-fetches before signing (see verifyQuote)
  const query = useQuery({
    ...getDepositQuoteQueryOptions({
      collector,
      depositQueue,
      amount: debouncedAmount,
      account: userAddress,
    }),
    enabled: isEnabled,
  });

  // Ensure that the token is lowercase to match TOKENS
  const tokenLowercase = token?.toLowerCase();
  const isWstEth = tokenLowercase === TOKENS.wsteth;

  const wstethUsdQuery = useWstethUsd(debouncedAmount ?? 0n);
  const ethUsdQuery = useEthUsd(debouncedAmount ?? 0n);
  const usdQuery = isWstEth ? wstethUsdQuery : ethUsdQuery;

  const { data: stethByWsteth } = useStETHByWstETH(debouncedAmount);
  const eth = isWstEth ? stethByWsteth : (debouncedAmount ?? 0n);

  return {
    isLoading: isDebounced || query.isLoading || usdQuery?.isLoading,
    data: {
      shares: query.data?.shares,
      penaltyD6: query.data?.penaltyD6,
      eth,
      usd: usdQuery.usdAmount,
    },
  };
};
