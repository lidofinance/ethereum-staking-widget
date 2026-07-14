import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { randomColor } from 'features/earn/shared/vault-allocation/utils';
import { getAllocationProtocolIcon } from 'features/earn/shared/vault-allocation/protocol-icon/icon-library';
import type { MetavaultsAllocationFetchedData } from '../apy-data/metavaults-allocation';
import type {
  AllocationGroup,
  AllocationSubItem,
  AllocationTableData,
  FlatAllocationItem,
  LineDataWithAllocation,
} from '../types';
import {
  AVAILABLE_TIP,
  OTHER_TIP,
  PENDING_TIP,
  SUBVAULTS_TIP_BY_ID,
} from '../consts';

type ApiAllocation = MetavaultsAllocationFetchedData['allocations'][number];

const MIN_DISPLAY_PERCENT = 0.1;
const MAX_SUBVAULT_POSITIONS = 20;
const isVisible = (allocation: number): boolean =>
  allocation >= MIN_DISPLAY_PERCENT;

const sortByAllocationDescending = <T extends { allocation: number }>(
  left: T,
  right: T,
): number => right.allocation - left.allocation;

const parseTvlUSD = (amount: string, decimals: number): number =>
  Number(formatUnits(BigInt(amount), decimals));

// Entries that match these categories are accumulated into the
// Available / Pending / Others rows shown in the allocation table.
const ALLOCATION_SUMMARY_KEYS = ['available', 'pending', 'others'] as const;
const ALLOCATION_NON_OTHER_SUMMARY_KEYS = ['available', 'pending'] as const;
type AllocationSummaryKey = (typeof ALLOCATION_SUMMARY_KEYS)[number];
type AllocationSummaryRows = Record<
  AllocationSummaryKey,
  { allocation: number; tvlUSD: number }
>;

// Display metadata for summary rows produced from accumulated API entries.
const ALLOCATION_SUMMARY_META: Record<
  AllocationSummaryKey,
  { label: string; id: string; info: string }
> = {
  available: { label: 'Available', id: 'available', info: AVAILABLE_TIP },
  pending: { label: 'Pending', id: 'pending', info: PENDING_TIP },
  others: { label: 'Others', id: 'others', info: OTHER_TIP },
};

const createAllocationSummaryRows = (): AllocationSummaryRows => ({
  available: { allocation: 0, tvlUSD: 0 },
  pending: { allocation: 0, tvlUSD: 0 },
  others: { allocation: 0, tvlUSD: 0 },
});

const addToAllocationSummaryRow = (
  summaryRows: AllocationSummaryRows,
  key: AllocationSummaryKey,
  allocation: number,
  tvlUSD: number,
): void => {
  summaryRows[key].allocation += allocation;
  summaryRows[key].tvlUSD += tvlUSD;
};

const moveInvisibleSummaryRowsToOthers = (
  summaryRows: AllocationSummaryRows,
): void => {
  for (const key of ALLOCATION_NON_OTHER_SUMMARY_KEYS) {
    const summary = summaryRows[key];

    if (summary.allocation > 0 && !isVisible(summary.allocation)) {
      addToAllocationSummaryRow(
        summaryRows,
        'others',
        summary.allocation,
        summary.tvlUSD,
      );
      summary.allocation = 0;
      summary.tvlUSD = 0;
    }
  }
};

const limitNestedItems = (
  items: AllocationSubItem[],
  summaryRows: AllocationSummaryRows,
): AllocationSubItem[] => {
  items.sort(sortByAllocationDescending);

  if (items.length <= MAX_SUBVAULT_POSITIONS) {
    return items;
  }

  for (const item of items.slice(MAX_SUBVAULT_POSITIONS)) {
    addToAllocationSummaryRow(
      summaryRows,
      'others',
      item.allocation,
      item.tvlUSD,
    );
  }

  return items.slice(0, MAX_SUBVAULT_POSITIONS);
};

const ALLOCATION_SUMMARY_KEY_BY_CATEGORY = {
  token: 'available',
  'pending-deposits': 'pending',
  other: 'others',
} as const;

const getAllocationSummaryKey = (
  category: ApiAllocation['category'],
): AllocationSummaryKey | undefined =>
  category === 'protocol'
    ? undefined
    : ALLOCATION_SUMMARY_KEY_BY_CATEGORY[category];

const appendNestedSummaryRows = (
  items: AllocationSubItem[],
  summaryRows: AllocationSummaryRows,
): void => {
  for (const key of ALLOCATION_SUMMARY_KEYS) {
    const summary = summaryRows[key];

    if (isVisible(summary.allocation)) {
      const meta = ALLOCATION_SUMMARY_META[key];

      items.push({
        label: meta.label,
        id: meta.id,
        icon: undefined,
        info: meta.info,
        chain: '',
        allocation: summary.allocation,
        tvlUSD: summary.tvlUSD,
      });
    }
  }
};

const appendFlatSummaryRows = (
  items: FlatAllocationItem[],
  summaryRows: AllocationSummaryRows,
): void => {
  for (const key of ALLOCATION_SUMMARY_KEYS) {
    const summary = summaryRows[key];

    if (isVisible(summary.allocation)) {
      const meta = ALLOCATION_SUMMARY_META[key];

      items.push({
        name: meta.label,
        info: meta.info,
        allocation: summary.allocation,
        tvlUSD: summary.tvlUSD,
      });
    }
  }
};

const parseNestedGroup = (
  alloc: ApiAllocation,
  tvlUSD: number,
): AllocationGroup => {
  const summaryRows = createAllocationSummaryRows();
  const knownItems: AllocationSubItem[] = [];

  for (const sub of alloc.allocations) {
    // Nested sub-allocations only carry a share, so derive their TVL from the
    // parent vault TVL before applying the same category rules as flat items.
    const subTvl = tvlUSD * (sub.sharePercent / 100);
    const summaryKey = getAllocationSummaryKey(sub.category);

    if (summaryKey) {
      addToAllocationSummaryRow(
        summaryRows,
        summaryKey,
        sub.sharePercent,
        subTvl,
      );
    } else if (isVisible(sub.sharePercent)) {
      knownItems.push({
        label: sub.label,
        id: sub.id,
        icon: getAllocationProtocolIcon(sub.protocol),
        chain: sub.chain,
        allocation: sub.sharePercent,
        tvlUSD: subTvl,
      });
    } else if (sub.sharePercent > 0) {
      addToAllocationSummaryRow(
        summaryRows,
        'others',
        sub.sharePercent,
        subTvl,
      );
    }
  }

  moveInvisibleSummaryRowsToOthers(summaryRows);
  const limitedItems = limitNestedItems(knownItems, summaryRows);
  appendNestedSummaryRows(limitedItems, summaryRows);

  return {
    name: alloc.label,
    allocation: alloc.sharePercent,
    tvlUSD,
    items: limitedItems,
    info: SUBVAULTS_TIP_BY_ID[alloc.id],
  };
};

const parseFlatItems = (
  allocations: ApiAllocation[],
  summaryRows = createAllocationSummaryRows(),
): FlatAllocationItem[] => {
  const items: FlatAllocationItem[] = [];

  for (const alloc of allocations) {
    const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);
    const summaryKey = getAllocationSummaryKey(alloc.category);

    if (summaryKey) {
      addToAllocationSummaryRow(
        summaryRows,
        summaryKey,
        alloc.sharePercent,
        tvlUSD,
      );
    } else if (isVisible(alloc.sharePercent)) {
      items.push({
        name: alloc.label,
        chain: alloc.chain,
        icon: getAllocationProtocolIcon(alloc.protocol),
        allocation: alloc.sharePercent,
        tvlUSD,
      });
    } else if (alloc.sharePercent > 0) {
      addToAllocationSummaryRow(
        summaryRows,
        'others',
        alloc.sharePercent,
        tvlUSD,
      );
    }
  }

  items.sort(sortByAllocationDescending);
  moveInvisibleSummaryRowsToOthers(summaryRows);
  appendFlatSummaryRows(items, summaryRows);

  return items;
};

const buildChartData = (
  entries: Array<{ name: string; allocation: number }>,
): LineDataWithAllocation[] => {
  const total = entries.reduce((sum, e) => sum + e.allocation, 0);
  if (total <= 0) return [];

  let currentValue = 0;

  return entries.map((entry, index) => {
    // Each threshold marks the end of the current segment in the allocation line.
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
    const topLevelSummaryRows = createAllocationSummaryRows();

    for (const alloc of apiData.allocations) {
      if (alloc.type === 'nested') {
        const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);
        const group = parseNestedGroup(alloc, tvlUSD);

        if (isVisible(group.allocation)) {
          groups.push(group);
        } else {
          addToAllocationSummaryRow(
            topLevelSummaryRows,
            'others',
            group.allocation,
            group.tvlUSD,
          );
        }
      } else {
        flatAllocations.push(alloc);
      }
    }

    const flatItems = parseFlatItems(flatAllocations, topLevelSummaryRows);
    groups.sort(sortByAllocationDescending);

    const totalTvlUsd = parseTvlUSD(
      apiData.totalTvl.usd,
      apiData.totalTvl.usd_decimals,
    );
    const chartData = buildChartData([...groups, ...flatItems]);

    return {
      lastUpdated: Number(apiData.lastUpdate),
      chartData,
      groups,
      ...(flatItems.length > 0 && { flatItems }),
      totalTvlUsd,
    };
  }, [apiData]);
};
