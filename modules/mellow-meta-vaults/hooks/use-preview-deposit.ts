import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useStETHByWstETH } from 'modules/web3/hooks/use-stETH-by-wstETH';
import { TOKENS } from 'consts/tokens';
import { MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import { CollectorContract, DepositQueueContract } from '../types/contracts';
import { readDepositQuote, type VaultQuote } from '../utils/quote';

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

  const query = useQuery({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      'preview-deposit',
      collector.address,
      depositQueue.address,
      {
        amount: isEnabled ? debouncedAmount?.toString() : null,
        token: isEnabled ? token : null,
      },
    ] as const,
    enabled: isEnabled,
    queryFn: async (): Promise<VaultQuote> => {
      invariant(userAddress, 'User address is not available');

      if (!debouncedAmount) return { amountIn: 0n, amountOut: 0n };

      return readDepositQuote({
        collector,
        depositQueue,
        amount: debouncedAmount,
        account: userAddress,
      });
    },
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
      shares: query.data?.amountOut,
      eth,
      usd: usdQuery.usdAmount,
    },
    // the displayed quote and its refetch: a deposit is held to it
    quote: query.data,
    refetchQuote: query.refetch,
  };
};
