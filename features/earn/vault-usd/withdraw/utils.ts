import { PublicClient } from 'viem';
import { COLLECTOR_CONFIG } from 'modules/mellow-meta-vaults/consts';
import { getCollectorContract, getRedeemQueueContractUSDC } from '../contracts';

export const getUsdWithdrawalParams = async ({
  shares,
  publicClient,
}: {
  shares: bigint;
  publicClient: PublicClient;
}) => {
  const collector = getCollectorContract(publicClient);
  const redeemQueueContract = getRedeemQueueContractUSDC(publicClient);

  return collector.read.getWithdrawalParams([
    shares,
    redeemQueueContract.address,
    COLLECTOR_CONFIG,
  ]);
};
