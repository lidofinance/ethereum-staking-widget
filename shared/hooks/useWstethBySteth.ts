import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

// TODO: NEW_SDK (remove)
// DEPRECATED
export const useWstethBySteth = (steth: bigint | undefined) => {
  return useContractSWR({
    contract: useWSTETHContractRPC(),
    method: 'getWstETHByStETH',
    // PROBLEMS HERE!
    // params: [BigNumber.from(steth)],
    params: [steth ? BigNumber.from(steth) : BigNumber.from(0)],
    shouldFetch: !!steth,
    config: STRATEGY_LAZY,
  });
};
