import { useQuery } from '@tanstack/react-query';
import { getContractAddress } from 'config/networks/contract-address';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { standardFetcher } from 'utils/standardFetcher';
import { CHAINS } from 'consts/chains';
import { useSTGCollect } from './use-stg-collect';

type STGStatsResponse = {
  apy: number;
};

const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');

const STG_STATS_ENDPOINT = `https://points.mellow.finance/v1/chain/${CHAINS.Mainnet}/core-vaults/${stgVaultAddress}/data`;

export const useSTGStats = () => {
  const { data, isLoading } = useQuery<{ apy: number; tvlWei?: bigint }>({
    queryKey: ['stg', 'stats'],
    queryFn: async () => {
      const json = await standardFetcher<STGStatsResponse>(STG_STATS_ENDPOINT);

      return { apy: json.apy };
    },
  });

  const { data: collectorData } = useSTGCollect();

  const { usdAmount: tvlUSD, isLoading: isEthUsdLoading } = useEthUsd(
    collectorData?.totalTvlWei,
  );

  return {
    isLoading: isLoading || isEthUsdLoading,
    tvl: tvlUSD,
    apy: data?.apy,
  } as const;
};
