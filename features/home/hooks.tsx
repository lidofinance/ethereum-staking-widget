import { SWRResponse, useEthereumBalance } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { useStakingLimitInfo } from 'shared/hooks';
import { bnMin } from 'utils';

export const useStakeableEther = (): Pick<
  SWRResponse<BigNumber>,
  'data' | 'initialLoading'
> => {
  const ethereumBalance = useEthereumBalance();
  const stakingLimitInfo = useStakingLimitInfo();

  return {
    initialLoading:
      ethereumBalance.initialLoading && stakingLimitInfo.initialLoading,
    data:
      ethereumBalance.data && stakingLimitInfo.data
        ? bnMin(ethereumBalance.data, stakingLimitInfo.data.currentStakeLimit)
        : undefined,
  };
};
