import { stakingRouter } from 'consts/staking-router';

export const useStakingRouter = () => {
  const contractRpc = stakingRouter.useContractRPC();

  return { contractRpc };
};
