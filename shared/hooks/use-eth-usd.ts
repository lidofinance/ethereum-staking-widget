import { useMemo } from 'react';
import { getContract, type Address } from 'viem';
import invariant from 'tiny-invariant';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery } from '@tanstack/react-query';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useMainnetOnlyWagmi } from 'modules/web3';

const ETH_DECIMALS = 18n;
const PRECISION = 4n;

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

      const contract = getContract({
        address: getContractAddress(
          CHAINS.Mainnet,
          CONTRACT_NAMES.aggregatorEthUsdPriceFeed,
        ) as Address,
        abi: AggregatorAbi,
        client: {
          public: publicClientMainnet,
        },
      });

      const [latestAnswer, decimals] = await Promise.all([
        contract.read.latestAnswer(),
        contract.read.decimals(),
      ]);

      return {
        latestAnswer,
        decimals: BigInt(decimals),
      };
    },
  });

  const usdAmount = useMemo(() => {
    // shortcut
    if (amount == 0n) return 0;

    if (price && amount) {
      const ethInUsd_P4 =
        (amount * price.latestAnswer) /
        10n ** (price.decimals + ETH_DECIMALS - PRECISION);
      return Number(ethInUsd_P4) / 4;
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
