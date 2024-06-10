import { stakingRouter } from 'consts/staking-router';

export const useStakingRouter = () => {
  const contractWeb3 = stakingRouter.useContractWeb3();
  const contractRpc = stakingRouter.useContractRPC();

  return { contractWeb3, contractRpc };
};
