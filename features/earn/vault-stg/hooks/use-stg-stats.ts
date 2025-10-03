import { useQuery } from '@tanstack/react-query';
import { getContractAddress } from 'config/networks/contract-address';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { standardFetcher } from 'utils/standardFetcher';
import { CHAINS } from 'consts/chains';

type STGStatsResponse = {
  apy: number;
  totalTvl: {
    asset: string;
    amount: string; // wei, stringified bigint
    decimals: number; // expected 18 for ETH
  };
};

const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');

const STG_STATS_ENDPOINT = `https://points-staging.mellow.finance/v1/chain/${CHAINS.Mainnet}/core-vaults/${stgVaultAddress}/data`;

export const useSTGStats = () => {
  const { data, isLoading } = useQuery<{ apy: number; tvlWei?: bigint }>({
    queryKey: ['stg', 'stats'],
    queryFn: async () => {
      const json = await standardFetcher<STGStatsResponse>(STG_STATS_ENDPOINT);

      const tvlWei = json.totalTvl?.amount
        ? BigInt(json.totalTvl.amount)
        : undefined;

      return { apy: json.apy, tvlWei };
    },
  });

  const { usdAmount: tvlUSD, isLoading: isEthUsdLoading } = useEthUsd(
    data?.tvlWei,
  );

  return {
    isLoading: isLoading || isEthUsdLoading,
    tvl: tvlUSD,
    apy: data?.apy,
  } as const;
};
