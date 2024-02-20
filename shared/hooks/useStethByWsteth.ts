import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

export const useStethByWsteth = (
  wsteth: BigNumber | undefined,
): BigNumber | undefined => {
  return useContractSWR({
    contract: useWSTETHContractRPC(),
    method: 'getStETHByWstETH',
    params: [wsteth],
    shouldFetch: !!wsteth,
    config: STRATEGY_LAZY,
  }).data;
};
