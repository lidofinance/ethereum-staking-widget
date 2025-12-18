/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type Address, getContract } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { LidoSDKWrap } from '@lidofinance/lido-ethereum-sdk/wrap';

import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getContractAddress } from 'config/networks/contract-address';
import { AggregatorAbi } from 'abi/aggregator-abi';
import { CHAINS } from 'consts/chains';
import { useMainnetOnlyWagmi } from 'modules/web3';

import { getDVVVaultContract } from '../contracts';
import { fetchDVVStatsAprBreakdown } from '../utils';

const PRECISION = 4n;

const useDVVTvl = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();

  return useQuery({
    queryKey: ['dvv', 'stats', 'tvl'],
    queryFn: async () => {
      const vault = getDVVVaultContract(publicClientMainnet);

      const wrap = new LidoSDKWrap({
        chainId: publicClientMainnet.chain!.id,
        logMode: 'none',
        rpcProvider: publicClientMainnet,
      });

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

      const [latestAnswer, decimals, tvlWsteth] = await Promise.all([
        contract.read.latestAnswer(),
        contract.read.decimals(),
        vault.read.totalAssets(),
      ]);

      const tvlSteth = await wrap.convertWstethToSteth(tvlWsteth);

      // tvl in USD w/ 4points after decimals
      const tvlUSD_4P =
        (tvlSteth * latestAnswer) / 10n ** (BigInt(decimals) + 18n - PRECISION);

      return {
        tvlWETH: tvlSteth,
        tvlUSD_4P: tvlUSD_4P,
        tvlUSD: Number(tvlUSD_4P) / 10 ** Number(PRECISION),
      };
    },
  });
};

export type MellowAPIResponse = {
  id: string;
  chain_id: number;
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  layer: string;
  points: Array<{
    id: string;
    value: string;
  }>;
  base_token: {
    address: string;
    symbol: string;
    decimals: number;
  };
  underlying_tokens: Array<{
    address: string;
    symbol: string;
    decimals: number;
  }>;
  deposit_tokens: Array<{
    address: string;
    symbol: string;
    decimals: number;
  }>;
  withdraw_tokens: Array<{
    address: string;
    symbol: string;
    decimals: number;
  }>;
  withdraw_avg_time_seconds: number;
  price: number;
  apr: number;
  apr_breakdown: Array<{
    id: string;
    type: string;
    value: number;
    address: string;
    symbol: string;
    decimals: number;
    updated_at: number;
    time_range: number;
  }>;
  tvl_usd: number;
  tvl_base_token: string;
  limit_usd: number;
  limit_base_token: string;
  total_supply: string;
  collector: string;
}[];

export const useDVVApr = () => {
  return useQuery({
    queryKey: ['dvv', 'stats', 'apr'],
    queryFn: async () => {
      return fetchDVVStatsAprBreakdown();
    },
  });
};

export const useDVVStats = () => {
  const { data: tvl, isLoading: isTvlLoading } = useDVVTvl();
  const { data: apr, isLoading: isAprLoading } = useDVVApr();

  return {
    isLoading: isTvlLoading || isAprLoading,
    tvl: tvl?.tvlUSD,
    apr: apr?.apr,
  };
};
