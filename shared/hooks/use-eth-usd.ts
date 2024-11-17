import { useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { encodeFunctionData, decodeAbiParameters } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useLidoQuery } from 'shared/hooks/use-lido-query';

// Chainlink ETH/USD
// only mainnet
const ETH_USD_AGGREGATOR = '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419';

const aggregatorAbi = [
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const useEthUsd = (amount?: bigint) => {
  const publicClientMainnet = usePublicClient({ chainId: CHAINS.Mainnet });

  const {
    data: price,
    error,
    loading,
    refetch,
    initialLoading,
  } = useLidoQuery({
    queryKey: ['eth-usd-price'],
    enabled: !!publicClientMainnet,
    strategy: STRATEGY_LAZY,
    queryFn: async () => {
      if (!publicClientMainnet) return;

      const callData = encodeFunctionData({
        abi: aggregatorAbi,
        functionName: 'latestAnswer',
      });

      const result = await publicClientMainnet.call({
        to: ETH_USD_AGGREGATOR,
        data: callData,
      });

      const [latestAnswer] = decodeAbiParameters(
        [{ internalType: 'int256', name: '', type: 'int256' }],
        result.data as `0x${string}`, // view returns (uint256)
      );

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
    initialLoading,
    error,
    loading,
    update: refetch,
  };
};
