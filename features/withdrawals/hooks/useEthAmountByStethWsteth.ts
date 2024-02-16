import { BigNumber } from 'ethers';
import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';

import { STRATEGY_LAZY } from 'utils/swrStrategies';

type useEthAmountByInputProps = {
  isSteth: boolean;
  amount: BigNumber | null;
};

export const useEthAmountByStethWsteth = ({
  isSteth,
  amount,
}: useEthAmountByInputProps) => {
  const wsteth = isSteth ? null : amount;
  const { data: stethByWstethBalance, loading } = useContractSWR({
    contract: useWSTETHContractRPC(),
    method: 'getStETHByWstETH',
    params: [wsteth],
    shouldFetch: !!wsteth,
    config: STRATEGY_LAZY,
  });

  if (isSteth)
    return {
      amount: amount ?? undefined,
      loading: false,
    };
  else return { amount: stethByWstethBalance, loading };
};
