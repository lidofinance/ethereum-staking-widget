import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

// TODO: NEW_SDK (remove)
// DEPRECATED
export const useStethByWsteth = (wsteth: bigint | undefined) => {
  return useContractSWR({
    contract: useWSTETHContractRPC(),
    method: 'getStETHByWstETH',
    params: [BigNumber.from(wsteth)],
    shouldFetch: !!wsteth,
    config: STRATEGY_LAZY,
  });
};
