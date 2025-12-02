import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { getContractAddress } from 'config/networks/contract-address';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { standardFetcher } from 'utils/standardFetcher';
import {
  UNIX_TIMESTAMP_SCHEMA,
  PERCENT_SCHEMA,
  APY_SCHEMA,
  logZodParseErrors,
} from 'utils/zod';
import { CHAINS } from 'consts/chains';
import { useSTGCollect } from './use-stg-collect';

const ALLOCATION_SCHEMA = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    sharePercent: PERCENT_SCHEMA,
    tvl: z.object({
      amount: z.string(),
      asset: z.string(),
      decimals: z.number(),
    }),
    chain: z.string(),
  }),
);
const STG_STATS_SCHEMA = z.object({
  apy: APY_SCHEMA,
  allocations: ALLOCATION_SCHEMA,
  lastUpdate: UNIX_TIMESTAMP_SCHEMA,
});

type STGStatsJSON = z.infer<typeof STG_STATS_SCHEMA>;

type STGStatsQueryData = {
  apy: STGStatsJSON['apy'] | null;
  allocations: STGStatsJSON['allocations'];
  lastUpdateTimestamp: number | null;
};

const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');

const STG_STATS_ENDPOINT = `https://points.mellow.finance/v1/chain/${CHAINS.Mainnet}/core-vaults/${stgVaultAddress}/data`;

const DEFAULT_DATA: STGStatsQueryData = {
  apy: null,
  allocations: [],
  lastUpdateTimestamp: null,
};

export const useSTGStats = () => {
  const { data, isLoading } = useQuery<STGStatsQueryData>({
    queryKey: ['stg', 'stats'],
    queryFn: async () => {
      const json = await standardFetcher<STGStatsJSON>(STG_STATS_ENDPOINT);

      const apyParsed = APY_SCHEMA.safeParse(json.apy);
      const allocationsParsed = ALLOCATION_SCHEMA.safeParse(json.allocations);
      const lastUpdateParsed = UNIX_TIMESTAMP_SCHEMA.safeParse(json.lastUpdate);

      logZodParseErrors(apyParsed, allocationsParsed, lastUpdateParsed);

      return {
        apy: apyParsed.success ? apyParsed.data : DEFAULT_DATA.apy,
        allocations: allocationsParsed.success
          ? allocationsParsed.data
          : DEFAULT_DATA.allocations,
        lastUpdateTimestamp: lastUpdateParsed.success
          ? lastUpdateParsed.data
          : DEFAULT_DATA.lastUpdateTimestamp,
      };
    },
  });

  const { data: collectorData, isLoading: isCollectorLoading } =
    useSTGCollect();
  const totalTvlWei = collectorData?.totalTvlWei;

  const { usdAmount: totalTvlUsd, isLoading: isEthUsdLoading } =
    useEthUsd(totalTvlWei);

  return {
    isLoading: isLoading || isCollectorLoading || isEthUsdLoading,
    totalTvlUsd,
    totalTvlWei,
    apy: data?.apy,
    allocations: data?.allocations || [],
    lastUpdateTimestamp: data?.lastUpdateTimestamp,
  } as const;
};
