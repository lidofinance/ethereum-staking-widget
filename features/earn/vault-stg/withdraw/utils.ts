import { PublicClient } from 'viem';
import {
  getSTGCollectorContract,
  getSTGRedeemQueueContractWSTETH,
} from '../contracts';

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
    {
      baseAssetFallback: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      oracleUpdateInterval: 86400n,
      redeemHandlingInterval: 3600n,
    },
  ]);
};
