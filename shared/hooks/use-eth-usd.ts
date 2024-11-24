import { useMemo } from 'react';
import type { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import { useQuery } from '@tanstack/react-query';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK } from 'consts/aggregator';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

export const useEthUsd = (amount?: bigint) => {
  const publicClientMainnet = usePublicClient({ chainId: CHAINS.Mainnet });

  const {
    data: price,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['eth-usd-price'],
    enabled: !!publicClientMainnet,
    ...STRATEGY_LAZY,
    queryFn: async () => {
      if (!publicClientMainnet) return;

      const latestAnswer = await publicClientMainnet.readContract({
        address: AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[
          CHAINS.Mainnet
        ] as Address,
        abi: AggregatorAbi,
        functionName: 'latestAnswer',
      });

      return latestAnswer / BigInt(10 ** 8);
    },
  });

  const usdAmount = useMemo(() => {
    if (price && amount) {
      // There is no need for absolute precision here
      const txCostInEth = Number(amount) / 10 ** 18;
      return txCostInEth * Number(price);
    }
    return undefined;
  }, [amount, price]);

  return {
    usdAmount,
    price,
    isLoading,
    error,
    isFetching,
    update: refetch,
  };
};
