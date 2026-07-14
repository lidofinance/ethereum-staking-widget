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
  SUBVAULTS_WITH_TIP,
} from '../consts';

type ApiAllocation = MetavaultsAllocationFetchedData['allocations'][number];

// FormatPercent renders one decimal, so smaller values are displayed as 0%.
const MIN_DISPLAY_PERCENT = 0.05;
const isVisible = (allocation: number): boolean =>
  allocation >= MIN_DISPLAY_PERCENT;

const parseTvlUSD = (amount: string, decimals: number): number =>
  Number(formatUnits(BigInt(amount), decimals));

const ALLOCATION_PROTOCOL_IDS_KNOWN_SET = new Set<string>(
  ALLOCATION_PROTOCOL_IDS_KNOWN,
);
const ALLOCATION_TOKEN_IDS_AVAILABLE_SET = new Set<string>(
  ALLOCATION_TOKEN_IDS_AVAILABLE,
);
const ALLOCATION_TOKEN_IDS_WITH_AVAILABLE_LABEL = new Set<string>([
  'usdc',
  'usdt',
]);

// Entries that match these categories are accumulated into the
// Available / Pending / Others rows shown in the allocation table.
const ALLOCATION_SUMMARY_KEYS = ['available', 'pending', 'others'] as const;
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

type AllocationCategory =
  | { type: 'summary'; summaryKey: AllocationSummaryKey }
  | { type: 'protocol'; id: AllocationProtocolId };

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

const isKnownProtocolId = (id: string): id is AllocationProtocolId =>
  ALLOCATION_PROTOCOL_IDS_KNOWN_SET.has(id);

const getAllocationCategory = (id: string): AllocationCategory => {
  if (ALLOCATION_TOKEN_IDS_AVAILABLE_SET.has(id))
    return { type: 'summary', summaryKey: 'available' };
  if (id === ALLOCATION_PENDING_ID)
    return { type: 'summary', summaryKey: 'pending' };
  if (isKnownProtocolId(id)) return { type: 'protocol', id };

  return { type: 'summary', summaryKey: 'others' };
};

const getFlatAllocationName = (alloc: ApiAllocation): string =>
  ALLOCATION_TOKEN_IDS_WITH_AVAILABLE_LABEL.has(alloc.id)
    ? `Available ${alloc.label}`
    : alloc.label;

const appendNestedSummaryRows = (
  items: AllocationSubItem[],
  summaryRows: AllocationSummaryRows,
): void => {
  for (const key of ALLOCATION_SUMMARY_KEYS) {
    const summary = summaryRows[key];

    if (summary.allocation > 0) {
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

    if (summary.allocation > 0) {
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
    const category = getAllocationCategory(sub.id);

    if (category.type === 'summary') {
      addToAllocationSummaryRow(
        summaryRows,
        category.summaryKey,
        sub.sharePercent,
        subTvl,
      );
    } else {
      knownItems.push({
        label: sub.label,
        id: sub.id,
        icon: ALLOCATION_ICONS_BY_ID[category.id],
        chain: sub.chain,
        allocation: sub.sharePercent,
        tvlUSD: subTvl,
      });
    }
  }

  appendNestedSummaryRows(knownItems, summaryRows);

  return {
    name: alloc.label,
    allocation: alloc.sharePercent,
    tvlUSD,
    items: knownItems.filter((item) => isVisible(item.allocation)),
    info: SUBVAULTS_TIP_BY_ID[alloc.id as SUBVAULTS_WITH_TIP],
  };
};

const parseFlatItems = (
  allocations: ApiAllocation[],
  summaryRows = createAllocationSummaryRows(),
): FlatAllocationItem[] => {
  const items: FlatAllocationItem[] = [];

  for (const alloc of allocations) {
    const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);
    const category = getAllocationCategory(alloc.id);

    if (category.type === 'summary') {
      addToAllocationSummaryRow(
        summaryRows,
        category.summaryKey,
        alloc.sharePercent,
        tvlUSD,
      );
    } else {
      items.push({
        name: getFlatAllocationName(alloc),
        allocation: alloc.sharePercent,
        tvlUSD,
      });
    }
  }

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

    const filteredFlatItems = parseFlatItems(
      flatAllocations,
      topLevelSummaryRows,
    ).filter((item) => isVisible(item.allocation));

    const totalTvlUsd = parseTvlUSD(
      apiData.totalTvl.usd,
      apiData.totalTvl.usd_decimals,
    );
    const chartData = buildChartData([...groups, ...filteredFlatItems]);

    return {
      lastUpdated: Number(apiData.lastUpdate),
      chartData,
      groups,
      ...(filteredFlatItems.length > 0 && { flatItems: filteredFlatItems }),
      totalTvlUsd,
    };
  }, [apiData]);
};
