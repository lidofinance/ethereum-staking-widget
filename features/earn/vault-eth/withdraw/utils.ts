import { PublicClient } from 'viem';
import { COLLECTOR_CONFIG } from 'modules/mellow-meta-vaults/consts';
import {
  getCollectorContract,
  getRedeemQueueContractWSTETH,
} from '../contracts';

export const getWithdrawalParams = async ({
  shares,
  publicClient,
}: {
  shares: bigint;
  publicClient: PublicClient;
}) => {
  const collector = getCollectorContract(publicClient);
  const redeemQueueContract = getRedeemQueueContractWSTETH(publicClient);

  return collector.read.getWithdrawalParams([
    shares,
    redeemQueueContract.address,
    COLLECTOR_CONFIG,
  ]);
};
