import { type Address, getContract } from 'viem';
import { useQuery } from '@tanstack/react-query';

import { AggregatorAbi } from 'abi/aggregator-abi';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { CHAINS } from 'consts/chains';

import { getGGVVaultContract } from '../../contracts';
import { fetchDailyGGVChainData, fetchGGVPerformance } from '../../utils';
import { useGGVApy } from '../../hooks/use-ggv-stats';

import {
  getAllocationData,
  createAllocationsChartData,
  createAllocationsData,
} from '../utils';

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
        totalTvlUSD,
        totalTvlUSDBigInt,
        totalAssetsETH,
        reserveAllocation,
        reserveAllocationPercentage,
        totalAllocationPercentage,
        lastUpdated,
      } = getAllocationData(tvlData, performanceData, latestAnswer, decimals);

      const allocations = createAllocationsData(
        reserveAllocationPercentage,
        totalTvlUSDBigInt,
        totalAssetsETH,
        reserveAllocation,
        performanceData.Response.real_apy_breakdown,
      );

      const chartData = createAllocationsChartData(
        allocations,
        totalAllocationPercentage,
      );

      return {
        chartData,
        allocations,
        totalTvlUSD,
        totalTvlETH: totalAssetsETH,
        lastUpdated,
      };
    },
  });

  return { ...allocation, apy: apy.data };
};
