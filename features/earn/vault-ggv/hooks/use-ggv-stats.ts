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
import {
  calculateGGVIncentivesAPY,
  fetchDailyGGVApy,
  fetchWeeklyGGVApy,
} from '../utils';
import { GGV_START_DATE } from '../consts';

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

const useGGVApy = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['ggv', 'stats', 'apy'],
    queryFn: async () => {
      const lens = getGGVLensContract(publicClientMainnet);
      const vault = getGGVVaultContract(publicClientMainnet);
      const accountant = getGGVAccountantContract(publicClientMainnet);

      const shouldSwitchTo7day =
        new Date().getTime() - GGV_START_DATE.getTime() >
        7 * 24 * 60 * 60 * 1000;

      if (shouldSwitchTo7day) {
        return fetchWeeklyGGVApy(vault.address);
      }

      const [dailyApr, [_, tvlWETH]] = await Promise.all([
        fetchDailyGGVApy(vault.address),
        lens.read.totalAssets([vault.address, accountant.address]),
      ]);

      return dailyApr + calculateGGVIncentivesAPY(tvlWETH);
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
