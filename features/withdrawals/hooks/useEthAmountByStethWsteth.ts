import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import { ZERO } from 'modules/web3';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

type useEthAmountByInputProps = {
  isSteth: boolean;
  amount: bigint | null;
};

export const useEthAmountByStethWsteth = ({
  isSteth,
  amount,
}: useEthAmountByInputProps) => {
  const fallbackedAmount = amount ?? ZERO;
  const wsteth = isSteth ? null : fallbackedAmount;
  const { data: stethByWstethBalance, loading } = useContractSWR({
    contract: useWSTETHContractRPC(),
    method: 'getStETHByWstETH',
    params: [wsteth],
    shouldFetch: !!wsteth,
    config: STRATEGY_LAZY,
  });

  if (isSteth)
    return {
      amount: fallbackedAmount ?? ZERO,
      loading: false,
    };
  else return { amount: stethByWstethBalance?.toBigInt(), loading };
};
