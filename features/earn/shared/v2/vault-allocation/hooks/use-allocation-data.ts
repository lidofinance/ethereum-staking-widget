import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { randomColor } from 'features/earn/shared/vault-allocation/utils';
import { MetavaultsAllocationFetchedData } from '../apy-data/metavaults-allocation';
import {
  AllocationGroup,
  AllocationTableData,
  FlatAllocationItem,
} from '../types';

const parseTvlUSD = (amount: string, decimals: number): number =>
  Number(formatUnits(BigInt(amount), decimals));

export const useAllocationData = (
  apiData?: MetavaultsAllocationFetchedData,
): AllocationTableData => {
  return useMemo(() => {
    if (!apiData)
      return { lastUpdated: 0, chartData: [], groups: [], totalTvlUsd: 0 };

    const groups: AllocationGroup[] = [];
    const flatItems: FlatAllocationItem[] = [];

    for (const alloc of apiData.allocations) {
      const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);

      if (alloc.type === 'nested') {
        groups.push({
          name: alloc.label,
          allocation: alloc.sharePercent,
          tvlUSD,
          items: alloc.allocations
            .map((sub) => ({
              label: sub.label,
              id: sub.id,
              chain: sub.chain,
              allocation: sub.sharePercent,
              tvlUSD:
                Number(
                  formatUnits(BigInt(alloc.tvl.usd), alloc.tvl.usd_decimals),
                ) *
                (sub.sharePercent / 100),
            }))
            .filter((item) => Number((item.allocation / 100).toFixed(2)) > 0),
        });
      } else {
        flatItems.push({
          name: alloc.label,
          allocation: alloc.sharePercent,
          tvlUSD,
        });
      }
    }

    const filteredGroups = groups.filter(
      (item) => Number((item.allocation / 100).toFixed(2)) > 0,
    );
    const filteredFlatItems = flatItems.filter(
      (item) => Number((item.allocation / 100).toFixed(2)) > 0,
    );

    const allEntries = [...filteredGroups, ...filteredFlatItems];
    const totalTvlUsd = parseTvlUSD(
      apiData.totalTvl.usd,
      apiData.totalTvl.usd_decimals,
    );

    const chartData = allEntries.map((entry, index) => {
      const color = randomColor(index);
      return {
        color,
        threshold: {
          value: entry.allocation,
          color,
          label: entry.name,
          description: entry.name,
        },
        allocation: entry.allocation,
      };
    });

    return {
      lastUpdated: Number(apiData.lastUpdate),
      chartData,
      groups: filteredGroups,
      ...(flatItems.length > 0 && { flatItems: filteredFlatItems }),
      totalTvlUsd,
    };
  }, [apiData]);
};
