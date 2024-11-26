import { useMemo } from 'react';
import type { Address } from 'viem';
import invariant from 'tiny-invariant';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import { useQuery } from '@tanstack/react-query';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK } from 'consts/aggregator';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useMainnetOnlyWagmi } from 'modules/web3';

export const useEthUsd = (amount?: bigint) => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  const {
    data: price,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['eth-usd-price', publicClientMainnet],
    enabled: !!publicClientMainnet,
    ...STRATEGY_LAZY,
    // the async is needed here because the decimals will be requested soon
    queryFn: async () => {
      invariant(
        publicClientMainnet,
        '[useEthUsd] The "publicClientMainnet" must be define',
      );

      const latestAnswer = await publicClientMainnet.readContract({
        address: AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[
          CHAINS.Mainnet
        ] as Address,
        abi: AggregatorAbi,
        functionName: 'latestAnswer',
      });

      const decimals = await publicClientMainnet.readContract({
        address: AGGREGATOR_STETH_USD_PRICE_FEED_BY_NETWORK[
          CHAINS.Mainnet
        ] as Address,
        abi: AggregatorAbi,
        functionName: 'decimals',
      });

      return latestAnswer / 10n ** BigInt(decimals);
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
