import { BigNumber } from 'ethers';
import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import { STRATEGY_LAZY } from 'utils/swrStrategies';
import { Zero } from '@ethersproject/constants';

type useEthAmountByInputProps = {
  isSteth: boolean;
  amount: BigNumber | null;
};

export const useEthAmountByStethWsteth = ({
  isSteth,
  amount,
}: useEthAmountByInputProps) => {
  const fallbackedAmount = amount ?? Zero;
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
      amount: fallbackedAmount ?? Zero,
      loading: false,
    };
  else return { amount: stethByWstethBalance, loading };
};
