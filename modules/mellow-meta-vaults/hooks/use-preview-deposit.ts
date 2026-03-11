import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDebouncedValue } from 'shared/hooks/useDebouncedValue';
import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { useWstethUsd } from 'shared/hooks/use-wsteth-usd';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { useStETHByWstETH } from 'modules/web3/hooks/use-stETH-by-wstETH';
import { TOKENS } from 'consts/tokens';
import { COLLECTOR_CONFIG, MELLOW_VAULTS_QUERY_SCOPE } from '../consts';
import { CollectorContract, DepositQueueContract } from '../types/contracts';

export type DepositParams = {
  isDepositPossible: boolean;
  isDepositorWhitelisted: boolean;
  isMerkleProofRequired: boolean;
  asset: string; // address as hex string
  shares: bigint;
  sharesUSDC: bigint;
  assets: bigint;
  assetsUSDC: bigint;
  eta: bigint;
};

export const usePreviewDeposit = <DepositToken extends string>({
  depositQueue,
  collector,
  amount,
  token,
}: {
  depositQueue: DepositQueueContract;
  collector: CollectorContract;
  amount?: bigint | null;
  token?: DepositToken;
}) => {
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
    queryFn: async () => {
      invariant(userAddress, 'User address is not available');

      if (!debouncedAmount)
        return {
          shares: 0n,
        };

      const { shares } = (await collector.read.getDepositParams([
        depositQueue.address, // queue
        debouncedAmount, // assets
        userAddress, // account
        COLLECTOR_CONFIG, // config
      ])) as DepositParams;

      return {
        shares,
      };
    },
  });

  // Ensure that the token is lowercase to match TOKENS
  const tokenLowercase = token?.toLowerCase();
  const isWstEth = tokenLowercase === TOKENS.wsteth;

  const wstethUsdQuery = useWstethUsd(debouncedAmount ?? 0n);
  const ethUsdQuery = useEthUsd(debouncedAmount ?? 0n);
  const usdQuery = isWstEth ? wstethUsdQuery : ethUsdQuery;

  const { data: stethByWsteth } = useStETHByWstETH(debouncedAmount);
  const eth = isWstEth ? stethByWsteth : debouncedAmount ?? 0n;

  return {
    isLoading: isDebounced || query.isLoading || usdQuery?.isLoading,
    data: {
      shares: query.data?.shares,
      eth,
      usd: usdQuery.usdAmount,
    },
  };
};
