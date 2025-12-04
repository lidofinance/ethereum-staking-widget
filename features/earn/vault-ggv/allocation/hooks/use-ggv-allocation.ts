import { type Address, getContract } from 'viem';
import { useQuery } from '@tanstack/react-query';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { CHAINS } from 'consts/chains';
import { createAllocationsChartData } from 'features/earn/shared/vault-allocation/utils';

import { getGGVVaultContract } from '../../contracts';
import { fetchDailyGGVChainData, fetchGGVPerformance } from '../../utils';
import { useGGVApy } from '../../hooks/use-ggv-stats';

import { getAllocationData, createAllocationsData } from '../utils';

export const useGGVAllocation = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const apy = useGGVApy();

  const allocation = useQuery({
    queryKey: ['ggv', 'stats', 'allocation'],
    queryFn: async () => {
      const vault = getGGVVaultContract(publicClientMainnet);
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

      const [latestAnswer, decimals, performanceData, tvlData] =
        await Promise.all([
          contract.read.latestAnswer(),
          contract.read.decimals(),
          fetchGGVPerformance(vault.address),
          fetchDailyGGVChainData(vault.address),
        ]);

      const {
        totalTvlUsd,
        totalTvlUSDBigInt,
        totalTvlWei,
        reserveAllocation,
        reserveAllocationPercentage,
        totalAllocationPercentage,
        lastUpdated,
      } = getAllocationData(tvlData, performanceData, latestAnswer, decimals);

      const positions = createAllocationsData(
        reserveAllocationPercentage,
        totalTvlUSDBigInt,
        totalTvlWei,
        reserveAllocation,
        performanceData.Response.real_apy_breakdown,
      );

      const chartData = createAllocationsChartData(
        positions,
        totalAllocationPercentage,
      );

      return {
        chartData,
        positions,
        totalTvlUsd,
        totalTvlWei,
        lastUpdated,
      };
    },
  });

  return { ...allocation, apy: apy.data };
};
