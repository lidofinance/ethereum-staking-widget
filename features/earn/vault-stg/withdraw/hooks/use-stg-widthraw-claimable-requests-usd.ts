import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { getContract, type Address } from 'viem';
import invariant from 'tiny-invariant';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';

type ClaimableRequest = {
  timestamp: bigint;
  assets: bigint;
};

export const useStgWithdrawClaimableRequestsUsd = (
  claimableRequests: ClaimableRequest[],
) => {
  const publicClient = usePublicClient();
  return useQuery({
    queryKey: [
      'stg',
      'withdraw',
      'claimable-requests-usd',
      claimableRequests.map((r) => [
        r.timestamp.toString(),
        r.assets.toString(),
      ]),
    ] as const,
    enabled: !!publicClient && claimableRequests.length > 0,
    queryFn: async () => {
      invariant(publicClient, 'Public client is not available');

      const wrap = new LidoSDKWrap({
        chainId: publicClient.chain?.id,
        rpcProvider: publicClient,
        logMode: 'none',
      });

      const priceFeed = getContract({
        address: getContractAddress(
          CHAINS.Mainnet,
          CONTRACT_NAMES.aggregatorEthUsdPriceFeed,
        ) as Address,
        abi: AggregatorAbi,
        client: { public: publicClient },
      });

      const [latestAnswer, decimals] = await Promise.all([
        priceFeed.read.latestAnswer(),
        priceFeed.read.decimals(),
      ]);

      const priceDecimals = BigInt(decimals);
      const PRECISION = 8n; // Return USD with 8 decimals to match UI expectations

      const results = await Promise.all(
        claimableRequests.map(async (request) => {
          if (request.assets === 0n) {
            return [request.timestamp.toString(), 0n] as const;
          }

          const stethAmount = await wrap.convertWstethToSteth(request.assets);
          const usd8 =
            (stethAmount * latestAnswer) /
            10n ** (priceDecimals + 18n - PRECISION);

          return [request.timestamp.toString(), usd8] as const;
        }),
      );

      const map: Record<string, bigint> = {};
      for (const [key, value] of results) map[key] = value;
      return map;
    },
  });
};
