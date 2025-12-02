import * as z from 'zod';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getContractAddress } from 'config/networks/contract-address';
import { useEthUsd } from 'shared/hooks/use-eth-usd';
import { standardFetcher } from 'utils/standardFetcher';
import {
  UNIX_TIMESTAMP_SCHEMA,
  PERCENT_SCHEMA,
  APY_SCHEMA,
  validate,
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

type STGStatsFetchedData = z.infer<typeof STG_STATS_SCHEMA>;

const stgVaultAddress = getContractAddress(CHAINS.Mainnet, 'stgVault');

const STG_STATS_ENDPOINT = `https://points.mellow.finance/v1/chain/${CHAINS.Mainnet}/core-vaults/${stgVaultAddress}/data`;

export const useSTGStats = () => {
  const { data: fetchedData, isLoading } = useQuery<STGStatsFetchedData>({
    queryKey: ['stg', 'stats'],
    queryFn: () => standardFetcher<STGStatsFetchedData>(STG_STATS_ENDPOINT),
  });

  const apy = useMemo(
    () => validate(APY_SCHEMA, fetchedData?.apy),
    [fetchedData?.apy],
  );
  const allocationPositions = useMemo(
    () => validate(ALLOCATION_SCHEMA, fetchedData?.allocations),
    [fetchedData?.allocations],
  );
  const lastUpdateTimestamp = useMemo(
    () => validate(UNIX_TIMESTAMP_SCHEMA, fetchedData?.lastUpdate),
    [fetchedData?.lastUpdate],
  );

  const { data: collectorData, isLoading: isCollectorLoading } =
    useSTGCollect();
  const totalTvlWei = collectorData?.totalTvlWei;

  const { usdAmount: totalTvlUsd, isLoading: isEthUsdLoading } =
    useEthUsd(totalTvlWei);

  return {
    isLoading: isLoading || isCollectorLoading || isEthUsdLoading,
    totalTvlUsd,
    totalTvlWei,
    apy,
    fetchedPositions: allocationPositions,
    lastUpdateTimestamp,
  } as const;
};
