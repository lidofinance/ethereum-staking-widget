import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';

import { useDappStatus } from 'modules/web3/hooks/use-dapp-status';
import { getSTGCollectorContract, getSTGVaultContract } from '../contracts';

type STGCollectResponse = {
  vault: string;
  baseAsset: string;
  assets: string[];
  assetDecimals: number[]; // uint8[] -> number[]
  assetPrices: bigint[]; // uint256[] -> bigint[]
  queues: QueueInfo[];
  totalLP: bigint;
  limitLP: bigint;
  accountLP: bigint;
  totalBase: bigint;
  limitBase: bigint;
  accountBase: bigint;
  lpPriceBase: bigint;
  totalUSD: bigint;
  limitUSD: bigint;
  accountUSD: bigint;
  lpPriceUSD: bigint;
  deposits: RequestInfo[];
  withdrawals: RequestInfo[];
  blockNumber: bigint;
  timestamp: bigint;
};

type QueueInfo = {
  queue: string;
  asset: string;
  isDepositQueue: boolean;
  isPausedQueue: boolean;
  isSignatureQueue: boolean;
  pendingValue: bigint;
  values: bigint[];
};

type RequestInfo = {
  queue: string;
  asset: string;
  shares: bigint;
  assets: bigint;
  eta: bigint;
};

export const useSTGCollect = () => {
  const { address, isDappActive } = useDappStatus();
  const publicClient = usePublicClient();

  const isEnabled = isDappActive && !!address;

  const query = useQuery({
    queryKey: ['stg', 'collect', { address }] as const,
    queryFn: async () => {
      invariant(address, 'No address provided');
      invariant(publicClient, 'Public client is not available');

      const collector = getSTGCollectorContract(publicClient);
      const vaultContract = getSTGVaultContract(publicClient);

      const response: STGCollectResponse = await collector.read.collect([
        address, // account
        vaultContract.address, // vault
        {
          baseAssetFallback: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          oracleUpdateInterval: 86400n,
          redeemHandlingInterval: 3600n,
        }, // config
      ]);

      return { deposits: response.deposits };
    },
    enabled: isEnabled,
  });

  return {
    isLoading: query.isLoading,
    data: query.data,
  };
};
