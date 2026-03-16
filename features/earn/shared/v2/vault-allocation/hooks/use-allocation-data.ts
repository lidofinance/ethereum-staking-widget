import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { randomColor } from 'features/earn/shared/vault-allocation/utils';
import type { MetavaultsAllocationFetchedData } from '../apy-data/metavaults-allocation';
import type {
  AllocationGroup,
  AllocationSubItem,
  AllocationTableData,
  FlatAllocationItem,
  LineDataWithAllocation,
} from '../types';
import {
  type AllocationProtocolId,
  ALLOCATION_ICONS_BY_ID,
  ALLOCATION_PROTOCOL_IDS_KNOWN,
  ALLOCATION_TOKEN_IDS_AVAILABLE,
  ALLOCATION_PENDING_ID,
  AVAILABLE_TIP,
  OTHER_TIP,
  PENDING_TIP,
  SUBVAULTS_TIP_BY_ID,
} from '../consts';

type ApiAllocation = MetavaultsAllocationFetchedData['allocations'][number];

// Hides entries that would display as 0.00% in the UI
const MIN_DISPLAY_PERCENT = 0.01;
const isVisible = (allocation: number): boolean =>
  allocation >= MIN_DISPLAY_PERCENT;

const parseTvlUSD = (amount: string, decimals: number): number =>
  Number(formatUnits(BigInt(amount), decimals));

const parseNestedGroup = (
  alloc: ApiAllocation,
  tvlUSD: number,
): AllocationGroup => {
  let availableAlloc = 0;
  let availableTvl = 0;
  let pendingAlloc = 0;
  let pendingTvl = 0;
  let othersAlloc = 0;
  let othersTvl = 0;
  const knownItems: AllocationSubItem[] = [];

  for (const sub of alloc.allocations) {
    const subTvl = tvlUSD * (sub.sharePercent / 100);

    if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(sub.id)) {
      availableAlloc += sub.sharePercent;
      availableTvl += subTvl;
    } else if (sub.id === ALLOCATION_PENDING_ID) {
      pendingAlloc += sub.sharePercent;
      pendingTvl += subTvl;
    } else if (
      !ALLOCATION_PROTOCOL_IDS_KNOWN.includes(sub.id as AllocationProtocolId)
    ) {
      othersAlloc += sub.sharePercent;
      othersTvl += subTvl;
    } else {
      knownItems.push({
        label: sub.label,
        id: sub.id,
        icon: ALLOCATION_ICONS_BY_ID[sub.id as AllocationProtocolId],
        chain: sub.chain,
        allocation: sub.sharePercent,
        tvlUSD: subTvl,
      });
    }
  }

  if (availableAlloc > 0) {
    knownItems.push({
      label: 'Available',
      id: 'available',
      icon: undefined,
      info: AVAILABLE_TIP,
      chain: '',
      allocation: availableAlloc,
      tvlUSD: availableTvl,
    });
  }
  if (pendingAlloc > 0) {
    knownItems.push({
      label: 'Pending',
      id: 'pending',
      icon: undefined,
      info: PENDING_TIP,
      chain: '',
      allocation: pendingAlloc,
      tvlUSD: pendingTvl,
    });
  }
  if (othersAlloc > 0) {
    knownItems.push({
      label: 'Others',
      id: 'others',
      icon: undefined,
      info: OTHER_TIP,
      chain: '',
      allocation: othersAlloc,
      tvlUSD: othersTvl,
    });
  }

  return {
    name: alloc.label,
    allocation: alloc.sharePercent,
    tvlUSD,
    items: knownItems.filter((item) => isVisible(item.allocation)),
    info: SUBVAULTS_TIP_BY_ID[alloc.id],
  };
};

const parseFlatItems = (allocations: ApiAllocation[]): FlatAllocationItem[] => {
  const items: FlatAllocationItem[] = [];
  let availableAlloc = 0;
  let availableTvl = 0;
  let pendingAlloc = 0;
  let pendingTvl = 0;
  let othersAlloc = 0;
  let othersTvl = 0;

  for (const alloc of allocations) {
    const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);

    if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(alloc.id)) {
      availableAlloc += alloc.sharePercent;
      availableTvl += tvlUSD;
    } else if (alloc.id === ALLOCATION_PENDING_ID) {
      pendingAlloc += alloc.sharePercent;
      pendingTvl += tvlUSD;
    } else if (
      !ALLOCATION_PROTOCOL_IDS_KNOWN.includes(alloc.id as AllocationProtocolId)
    ) {
      othersAlloc += alloc.sharePercent;
      othersTvl += tvlUSD;
    } else {
      // TODO: refactor this
      if (alloc.id === 'usdc' || alloc.id === 'usdt') {
        items.push({
          name: `Available ${alloc.label}`,
          allocation: alloc.sharePercent,
          tvlUSD,
        });
      } else {
        items.push({
          name: alloc.label,
          allocation: alloc.sharePercent,
          tvlUSD,
        });
      }
    }
  }

  if (availableAlloc > 0)
    items.push({
      name: 'Available',
      info: AVAILABLE_TIP,
      allocation: availableAlloc,
      tvlUSD: availableTvl,
    });
  if (pendingAlloc > 0)
    items.push({
      name: 'Pending',
      info: PENDING_TIP,
      allocation: pendingAlloc,
      tvlUSD: pendingTvl,
    });
  if (othersAlloc > 0)
    items.push({
      name: 'Others',
      info: OTHER_TIP,
      allocation: othersAlloc,
      tvlUSD: othersTvl,
    });

  return items;
};

const buildChartData = (
  entries: Array<{ name: string; allocation: number }>,
): LineDataWithAllocation[] => {
  const total = entries.reduce((sum, e) => sum + e.allocation, 0);
  let currentValue = 0;

  return entries.map((entry, index) => {
    currentValue += entry.allocation / total;
    const color = randomColor(index);

    return {
      color,
      threshold: {
        value: currentValue,
        color,
        label: entry.name,
        description: entry.name,
      },
      allocation: entry.allocation,
    };
  });
};

export const useAllocationData = (
  apiData?: MetavaultsAllocationFetchedData,
): AllocationTableData => {
  return useMemo(() => {
    if (!apiData)
      return { lastUpdated: 0, chartData: [], groups: [], totalTvlUsd: 0 };

    const groups: AllocationGroup[] = [];
    const flatAllocations: ApiAllocation[] = [];

    for (const alloc of apiData.allocations) {
      if (alloc.type === 'nested') {
        const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);
        groups.push(parseNestedGroup(alloc, tvlUSD));
      } else {
        flatAllocations.push(alloc);
      }
    }

    const filteredGroups = groups.filter((g) => isVisible(g.allocation));
    const filteredFlatItems = parseFlatItems(flatAllocations).filter((item) =>
      isVisible(item.allocation),
    );

    const totalTvlUsd = parseTvlUSD(
      apiData.totalTvl.usd,
      apiData.totalTvl.usd_decimals,
    );
    const chartData = buildChartData([...filteredGroups, ...filteredFlatItems]);

    return {
      lastUpdated: Number(apiData.lastUpdate),
      chartData,
      groups: filteredGroups,
      ...(filteredFlatItems.length > 0 && { flatItems: filteredFlatItems }),
      totalTvlUsd,
    };
  }, [apiData]);
};
