import { useContractSWR, useWSTETHContractRPC } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { STRATEGY_LAZY } from 'consts/swr-strategies';

export const useWstethBySteth = (steth: BigNumber | undefined) => {
  return useContractSWR({
    contract: useWSTETHContractRPC(),
    method: 'getWstETHByStETH',
    params: [steth],
    shouldFetch: !!steth,
    config: STRATEGY_LAZY,
  });
};
