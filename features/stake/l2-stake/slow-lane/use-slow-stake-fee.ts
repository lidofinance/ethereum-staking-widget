import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import type { Address } from 'viem';
import {
  LIDO_L2_STAKING_QUERY_SCOPE,
  type L2StakeModule,
} from 'modules/l2-staking';
import { useDappStatus, useLidoSDKL2 } from 'modules/web3';

type SlowStakeFeeQueryArgs = {
  l2Stake: L2StakeModule;
  chainId: number;
  amount: bigint;
  account?: Address;
};

// The CCIP quote for an amount: the cost to show and the cap to sign. One
// query definition for the form's display and its validation, so both read
// the same cache entry for the same amount
export const getSlowStakeFeeQueryOptions = ({
  l2Stake,
  chainId,
  amount,
  account,
}: SlowStakeFeeQueryArgs) =>
  queryOptions({
    queryKey: [
      LIDO_L2_STAKING_QUERY_SCOPE,
      'slow-stake-fee',
      { chainId, amount: amount.toString() },
    ],
    staleTime: 60 * 1000,
    queryFn: () => l2Stake.fetchSlowStakeFee({ amount, account }),
  });

type UseSlowStakeFeeArgs = {
  amount: bigint | null;
  // quoted only while the amount routes to the slow lane
  enabled?: boolean;
};

// Keyed by amount, since a lane may price by it; the previous quote stands
// in while the next one loads, so the cost does not blink per keystroke
export const useSlowStakeFee = ({
  amount,
  enabled = true,
}: UseSlowStakeFeeArgs) => {
  const { l2Stake, isL2Stake, chainId } = useLidoSDKL2();
  const { address } = useDappStatus();
  const isQuotable = isL2Stake && enabled && amount !== null && amount > 0n;
  return useQuery({
    ...getSlowStakeFeeQueryOptions({
      l2Stake,
      chainId,
      amount: amount ?? 0n,
      account: address,
    }),
    enabled: isQuotable,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};
