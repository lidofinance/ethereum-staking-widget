import { type Address, getContract } from 'viem';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { AggregatorAbi } from 'abi/aggregator-abi';
import { CHAINS } from 'consts/chains';

import { useMainnetOnlyWagmi } from 'modules/web3';

import { useQuery } from '@tanstack/react-query';
import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVVaultContract,
} from '../contracts';

const useGGVTvl = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['ggv', 'stats', 'tvl'],
    queryFn: async () => {
      const lens = getGGVLensContract(publicClientMainnet);
      const vault = getGGVVaultContract(publicClientMainnet);
      const accountant = getGGVAccountantContract(publicClientMainnet);

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

      const [latestAnswer, decimals, [_, tvlWETH]] = await Promise.all([
        contract.read.latestAnswer(),
        contract.read.decimals(),
        lens.read.totalAssets([vault.address, accountant.address]),
      ]);

      // tvl in USD w/ 4points after decimals
      const tvlUSD_4P =
        (tvlWETH * latestAnswer) / 10n ** (BigInt(decimals) + 18n - 4n);

      return {
        tvlWETH: tvlWETH,
        tvlUSD_4P: tvlUSD_4P,
        tvlUSD: Number(tvlUSD_4P) / 10 ** 4,
      };
    },
  });
};

type SevenSeasAPIPerformanceResponse = {
  Response: {
    aggregation_period: string;
    apy: number;
    chain_allocation: {
      base: number;
      bnb: number;
      corn: number;
      derive: number;
      ethereum: number;
    };
    fees: number;
    global_apy_breakdown: {
      fee: number;
      maturity_apy: number;
      real_apy: number;
    };
    maturity_apy_breakdown: unknown[];
    real_apy_breakdown: {
      allocation: number;
      apy: number;
      chain: string;
      protocol: string;
    }[];
    timestamp: string;
  };
};

const useGGVApy = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['ggv', 'stats', 'apy'],
    queryFn: async () => {
      const vault = getGGVVaultContract(publicClientMainnet);

      const url = `https://api.sevenseas.capital/performance/ethereum/${vault.address}`;

      const response = await fetch(url);
      const data = (await response.json()) as SevenSeasAPIPerformanceResponse;

      // TODO: double check decimals on this endpoint
      return data.Response.apy;
    },
  });
};

export const useGGVStats = () => {
  const { data: tvl, isLoading: isTvlLoading } = useGGVTvl();
  const { data: apy, isLoading: isApyLoading } = useGGVApy();

  return {
    isLoading: isTvlLoading || isApyLoading,
    tvl: tvl?.tvlUSD,
    apy: apy,
  };
};
