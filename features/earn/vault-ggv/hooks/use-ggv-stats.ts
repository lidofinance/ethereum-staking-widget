import { type Address, getContract } from 'viem';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { AggregatorAbi } from 'abi/aggregator-abi';
import { CHAINS } from 'consts/chains';
import { useConfig } from 'config';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { VaultAPYType } from 'config/external-config/types';

import { useQuery } from '@tanstack/react-query';
import {
  getGGVAccountantContract,
  getGGVLensContract,
  getGGVVaultContract,
} from '../contracts';
import {
  calculateGGVIncentivesAPY,
  fetchDailyGGVApy,
  fetchWeeklyGGVApy,
  fetchWeeklyGGVApyAverage,
} from '../utils';

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

const getGGVApy = async (
  vault: Address,
  ggvAPYType?: VaultAPYType,
): Promise<number> => {
  switch (ggvAPYType) {
    case 'weekly':
      return await fetchWeeklyGGVApy(vault);
    case 'weekly_moving_average':
      return await fetchWeeklyGGVApyAverage(vault);
    case 'daily':
      return (await fetchDailyGGVApy(vault)).daily;
    default:
      return (await fetchDailyGGVApy(vault)).daily;
  }
};

const useGGVApy = () => {
  const ggvAPYType = useConfig().externalConfig.earnVaults.find(
    (vault) => vault.name === 'ggv',
  )?.apy?.type;

  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['ggv', 'stats', 'apy', ggvAPYType],
    queryFn: async () => {
      const lens = getGGVLensContract(publicClientMainnet);
      const vault = getGGVVaultContract(publicClientMainnet);
      const accountant = getGGVAccountantContract(publicClientMainnet);
      const apy = await getGGVApy(vault.address, ggvAPYType);

      const [_, tvlWETH] = await lens.read.totalAssets([
        vault.address,
        accountant.address,
      ]);

      return Math.max(apy, calculateGGVIncentivesAPY(tvlWETH));
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
