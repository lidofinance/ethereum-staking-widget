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
  Response: [
    {
      block_number: number;
      daily_apy: number;
      price_usd: string;
      share_price: number;
      timestamp: string;
      total_assets: string;
      tvl: string;
      unix_seconds: number;
      vault_address: Address;
    },
  ];
};

const WEEK_SECONDS = 7 * 24 * 60 * 60;

const useGGVApy = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['ggv', 'stats', 'apy'],
    queryFn: async () => {
      const vault = getGGVVaultContract(publicClientMainnet);

      const weekAgo = Math.floor(new Date().getTime() / 1000 - WEEK_SECONDS);

      const url = `https://api.sevenseas.capital/dailyData/ethereum/${vault.address}/${weekAgo}/latest`;

      const response = await fetch(url);
      const data = (await response.json()) as SevenSeasAPIPerformanceResponse;

      const latestResponse = data.Response[0];

      if (!latestResponse) {
        throw new Error('[GGV-APY] No data found');
      }

      return latestResponse.daily_apy;
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
