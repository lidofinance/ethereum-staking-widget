import { useQuery } from '@tanstack/react-query';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { standardFetcher } from 'utils/standardFetcher';

type STGStatsResponse = {
  apy: number;
  totalTvl: {
    asset: string;
    amount: string; // wei, stringified bigint
    decimals: number; // expected 18 for ETH
  };
};

// TODO: use vault address from config after replacing test contracts with production ones
const STG_STATS_ENDPOINT =
  'https://points-staging.mellow.finance/v1/chain/1/core-vaults/0x277C6A642564A91ff78b008022D65683cEE5CCC5/data';

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
