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
      const tvlUSD = parseTvlUSD(alloc.tvl.amount, alloc.tvl.decimals);

      if (alloc.type === 'nested') {
        groups.push({
          name: alloc.label,
          allocation: alloc.sharePercent,
          tvlUSD,
          items: alloc.allocation.map((sub) => ({
            protocol: sub.protocol,
            chain: sub.chain,
            allocation: sub.sharePercent,
            tvlUSD: parseTvlUSD(sub.tvl.amount, sub.tvl.decimals),
          })),
        });
      } else {
        flatItems.push({
          name: alloc.label,
          allocation: alloc.sharePercent,
          tvlUSD,
        });
      }
    }

    const allEntries = [...groups, ...flatItems];
    const totalTvlUsd = allEntries.reduce(
      (sum, entry) => sum + entry.tvlUSD,
      0,
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
      lastUpdated: new Date(apiData.lastUpdate).getTime(),
      chartData,
      groups,
      ...(flatItems.length > 0 && { flatItems }),
      totalTvlUsd,
    };
  }, [apiData]);
};
