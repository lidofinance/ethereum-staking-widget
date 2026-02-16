import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { CollectorContract, VaultContract } from '../types/contracts';

import { useDappStatus, useMainnetOnlyWagmi } from 'modules/web3';
import { COLLECTOR_CONFIG, MELLOW_VAULTS_QUERY_SCOPE } from '../consts';

export type CollectResponse = {
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

export type QueueInfo = {
  queue: string;
  asset: string;
  isDepositQueue: boolean;
  isPausedQueue: boolean;
  isSignatureQueue: boolean;
  pendingValue: bigint;
  values: bigint[];
};

export type RequestInfo = {
  queue: string;
  asset: string;
  shares: bigint; // claimable shares
  assets: bigint;
  eta: bigint;
  timestamp: bigint;
};

export const useCollect = ({
  collector,
  vault,
}: {
  collector: CollectorContract;
  vault: VaultContract;
}) => {
  const { address: _address } = useDappStatus();
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  // Use zero address if no wallet connected and address is undefined
  // Because the contract call requires an address parameter
  const address = _address ?? '0x0000000000000000000000000000000000000000';

  const query = useQuery({
    queryKey: [
      MELLOW_VAULTS_QUERY_SCOPE,
      'collect',
      collector.address,
      vault.address,
      { address: address ?? null },
    ] as const,
    queryFn: async () => {
      invariant(publicClientMainnet, 'Public client is not available');

      const response: CollectResponse = (await collector.read.collect([
        address, // account
        vault.address, // vault
        COLLECTOR_CONFIG, // config
      ])) as CollectResponse;

      return {
        deposits: response.deposits,
        collectorTimestamp: response.timestamp,
        totalTvlWei: response.totalBase,
      };
    },
  });

  return {
    isLoading: query.isLoading,
    data: query.data,
  };
};
