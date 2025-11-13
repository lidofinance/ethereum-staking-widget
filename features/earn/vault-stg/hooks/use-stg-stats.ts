import { useQuery } from '@tanstack/react-query';
import { getContractAddress } from 'config/networks/contract-address';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { standardFetcher } from 'utils/standardFetcher';
import { CHAINS } from 'consts/chains';
import { useSTGCollect } from './use-stg-collect';

type STGAllocation = {
  id: string;
  label: string;
  sharePercent: number;
  tvl: { amount: string; asset: string; decimals: number };
  chain: string;
};

type STGStatsResponse = {
  apy: number;
  allocations: Array<STGAllocation>;
  lastUpdate: string;
};

type STGStatsQueryData = {
  apy: number;
  allocations: Array<STGAllocation>;
  lastUpdateTimestamp: number;
};

const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');

const STG_STATS_ENDPOINT = `https://points.mellow.finance/v1/chain/${CHAINS.Mainnet}/core-vaults/${stgVaultAddress}/data`;

export const useSTGStats = () => {
  const { data, isLoading } = useQuery<STGStatsQueryData>({
    queryKey: ['stg', 'stats'],
    queryFn: async () => {
      const json = await standardFetcher<STGStatsResponse>(STG_STATS_ENDPOINT);
      const lastUpdateTimestamp = Number(json.lastUpdate);
      return {
        apy: json.apy,
        allocations: json.allocations,
        lastUpdateTimestamp: lastUpdateTimestamp,
      };
    },
  });

  const { data: collectorData } = useSTGCollect();
  const totalTvlWei = collectorData?.totalTvlWei;

  const { usdAmount: totalTvlUsd, isLoading: isEthUsdLoading } =
    useEthUsd(totalTvlWei);

  return {
    isLoading: isLoading || isEthUsdLoading,
    totalTvlUsd,
    totalTvlWei,
    apy: data?.apy,
    allocations: data?.allocations || [],
    lastUpdateTimestamp: data?.lastUpdateTimestamp,
  } as const;
};
