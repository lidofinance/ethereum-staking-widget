import { useMemo } from 'react';
import { getContract, type Address } from 'viem';
import invariant from 'tiny-invariant';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';
import { useQuery } from '@tanstack/react-query';

import { useMainnetOnlyWagmi } from 'modules/web3';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { bnAmountToNumber } from 'utils/bn';

const ETH_DECIMALS = 18n;

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
      return bnAmountToNumber(
        amount * price.latestAnswer,
        Number(price.decimals + ETH_DECIMALS),
      );
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
