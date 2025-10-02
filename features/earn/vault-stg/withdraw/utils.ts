import { PublicClient } from 'viem';
import {
  getSTGCollectorContract,
  getSTGRedeemQueueContractWSTETH,
} from '../contracts';
import { STG_COLLECTOR_CONFIG } from '../consts';

export const getWithdrawalParams = async ({
  shares,
  publicClient,
}: {
  shares: bigint;
  publicClient: PublicClient;
}) => {
  const collector = getSTGCollectorContract(publicClient);
  const redeemQueueContract = getSTGRedeemQueueContractWSTETH(publicClient);

  return collector.read.getWithdrawalParams([
    shares,
    redeemQueueContract.address,
    STG_COLLECTOR_CONFIG,
  ]);
};
