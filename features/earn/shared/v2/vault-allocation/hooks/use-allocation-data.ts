import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { getOwnProperty } from 'utils/get-own-property';
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
  MIN_ALLOCATION_DISPLAY_PERCENT,
  OTHER_TIP,
  PENDING_TIP,
  SUBVAULTS_TIP_BY_ID,
} from '../consts';

type ApiAllocation = MetavaultsAllocationFetchedData['allocations'][number];

const MAX_SUBVAULT_POSITIONS = 20;
const EMPTY_ALLOCATION_LABEL_ALLOWLIST: readonly string[] = [];
const EMPTY_HIDDEN_ALLOCATION_IDS: readonly string[] = [];
const isVisible = (allocation: number): boolean =>
  allocation >= MIN_ALLOCATION_DISPLAY_PERCENT;

const sortByAllocationDescending = <T extends { allocation: number }>(
  left: T,
  right: T,
): number => right.allocation - left.allocation;

const parseTvlUSD = (amount: string, decimals: number): number =>
  Number(formatUnits(BigInt(amount), decimals));

const normalizeLabelWord = (word: string): string => word.toLowerCase();

const isLabelAllowed = (
  label: string,
  allowlist: ReadonlySet<string>,
): boolean => {
  const normalizedLabel = label.trim();
  if (!normalizedLabel) return false;

  return normalizedLabel
    .split(/[\s/]+/u)
    .map(normalizeLabelWord)
    .every((word) => allowlist.has(word));
};

type DiagnosticAllocationReason =
  | 'hidden-by-config'
  | 'label-not-allowlisted'
  | 'below-min-display-percent'
  | 'max-subvault-positions';

type DiagnosticAllocationData = {
  id: string;
  sharePercent: number;
};

// Entries that match these categories are accumulated into the
// Available / Pending / Others rows shown in the allocation table.
const ALLOCATION_SUMMARY_KEYS = ['available', 'pending', 'others'] as const;
const NESTED_ALLOCATION_SUMMARY_KEYS = ['pending', 'others'] as const;
const FLAT_ALLOCATION_SUMMARY_KEYS = [
  'pending',
  'others',
  'available',
] as const;
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

const moveAllocationToOthers = (
  summaryRows: AllocationSummaryRows,
  allocation: DiagnosticAllocationData,
  tvlUSD: number,
  reason: DiagnosticAllocationReason,
): void => {
  console.debug('[Vault allocation] Allocation moved to Others', {
    reason,
    id: allocation.id,
  });

  if (allocation.sharePercent <= 0) return;

  addToAllocationSummaryRow(
    summaryRows,
    'others',
    allocation.sharePercent,
    tvlUSD,
  );
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
    moveAllocationToOthers(
      summaryRows,
      {
        id: item.id,
        sharePercent: item.allocation,
      },
      item.tvlUSD,
      'max-subvault-positions',
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

type AllocationDisposition =
  | { type: 'summary'; key: AllocationSummaryKey }
  | { type: 'others'; reason: DiagnosticAllocationReason }
  | { type: 'visible' }
  | { type: 'ignored' };

const classifyAllocation = (
  allocation: DiagnosticAllocationData & {
    label: string;
    category: ApiAllocation['category'];
  },
  labelAllowlist: ReadonlySet<string>,
  hiddenAllocationIds: ReadonlySet<string>,
  options: { includeSummary?: boolean; includeVisibility?: boolean } = {},
): AllocationDisposition => {
  if (hiddenAllocationIds.has(allocation.id)) {
    return { type: 'others', reason: 'hidden-by-config' };
  }

  if (options.includeSummary !== false) {
    const summaryKey = getAllocationSummaryKey(allocation.category);
    if (summaryKey) return { type: 'summary', key: summaryKey };
  }

  if (!isLabelAllowed(allocation.label, labelAllowlist)) {
    return {
      type: 'others',
      reason: 'label-not-allowlisted',
    };
  }

  if (
    options.includeVisibility === false ||
    isVisible(allocation.sharePercent)
  ) {
    return { type: 'visible' };
  }

  if (allocation.sharePercent > 0) {
    return {
      type: 'others',
      reason: 'below-min-display-percent',
    };
  }

  return { type: 'ignored' };
};

const appendNestedSummaryRows = (
  items: AllocationSubItem[],
  summaryRows: AllocationSummaryRows,
): void => {
  for (const key of NESTED_ALLOCATION_SUMMARY_KEYS) {
    const summary = summaryRows[key];

    if (summary.allocation > 0) {
      const meta = ALLOCATION_SUMMARY_META[key];

      items.push({
        label: meta.label,
        id: meta.id,
        isSummary: true,
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
  for (const key of FLAT_ALLOCATION_SUMMARY_KEYS) {
    const summary = summaryRows[key];

    if (summary.allocation > 0) {
      const meta = ALLOCATION_SUMMARY_META[key];

      items.push({
        name: meta.label,
        isSummary: true,
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
  labelAllowlist: ReadonlySet<string>,
  hiddenAllocationIds: ReadonlySet<string>,
  topLevelSummaryRows: AllocationSummaryRows,
): AllocationGroup => {
  const summaryRows = createAllocationSummaryRows();
  const knownItems: AllocationSubItem[] = [];
  let availableAllocation = 0;
  let availableTvlUSD = 0;

  for (const sub of alloc.allocations) {
    // Nested sub-allocations only carry a share, so derive their TVL from the
    // parent vault TVL before applying the same category rules as flat items.
    const subTvl = tvlUSD * (sub.sharePercent / 100);
    const disposition = classifyAllocation(
      sub,
      labelAllowlist,
      hiddenAllocationIds,
    );

    if (disposition.type === 'summary') {
      if (disposition.key === 'available') {
        // A nested share is relative to its parent subvault. Convert it to the
        // whole-vault share before moving it to the flat Available row.
        const topLevelShare = alloc.sharePercent * (sub.sharePercent / 100);

        addToAllocationSummaryRow(
          topLevelSummaryRows,
          'available',
          topLevelShare,
          subTvl,
        );
        availableAllocation += topLevelShare;
        availableTvlUSD += subTvl;
      } else {
        addToAllocationSummaryRow(
          summaryRows,
          disposition.key,
          sub.sharePercent,
          subTvl,
        );
      }
    } else if (disposition.type === 'others') {
      moveAllocationToOthers(summaryRows, sub, subTvl, disposition.reason);
    } else if (disposition.type === 'visible') {
      knownItems.push({
        label: sub.label,
        id: sub.id,
        icon: getAllocationProtocolIcon(sub.protocol),
        chain: sub.chain,
        allocation: sub.sharePercent,
        tvlUSD: subTvl,
      });
    }
  }

  const limitedItems = limitNestedItems(knownItems, summaryRows);
  appendNestedSummaryRows(limitedItems, summaryRows);

  return {
    name: alloc.label,
    allocation: alloc.sharePercent - availableAllocation,
    tvlUSD: tvlUSD - availableTvlUSD,
    items: limitedItems,
    info: getOwnProperty(SUBVAULTS_TIP_BY_ID, alloc.id),
  };
};

const parseFlatItems = (
  allocations: ApiAllocation[],
  labelAllowlist: ReadonlySet<string>,
  hiddenAllocationIds: ReadonlySet<string>,
  summaryRows = createAllocationSummaryRows(),
): FlatAllocationItem[] => {
  const items: FlatAllocationItem[] = [];

  for (const alloc of allocations) {
    const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);
    const disposition = classifyAllocation(
      alloc,
      labelAllowlist,
      hiddenAllocationIds,
    );

    if (disposition.type === 'summary') {
      addToAllocationSummaryRow(
        summaryRows,
        disposition.key,
        alloc.sharePercent,
        tvlUSD,
      );
    } else if (disposition.type === 'others') {
      moveAllocationToOthers(summaryRows, alloc, tvlUSD, disposition.reason);
    } else if (disposition.type === 'visible') {
      items.push({
        name: alloc.label,
        chain: alloc.chain,
        icon: getAllocationProtocolIcon(alloc.protocol),
        allocation: alloc.sharePercent,
        tvlUSD,
      });
    }
  }

  items.sort(sortByAllocationDescending);
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
  allocationLabelAllowlist: readonly string[] = EMPTY_ALLOCATION_LABEL_ALLOWLIST,
  hiddenAllocationIds: readonly string[] = EMPTY_HIDDEN_ALLOCATION_IDS,
): AllocationTableData => {
  return useMemo(() => {
    if (!apiData)
      return { lastUpdated: 0, chartData: [], groups: [], totalTvlUsd: 0 };

    const groups: AllocationGroup[] = [];
    const flatAllocations: ApiAllocation[] = [];
    const topLevelSummaryRows = createAllocationSummaryRows();
    const labelAllowlist = new Set(
      allocationLabelAllowlist.map(normalizeLabelWord),
    );
    const hiddenIds = new Set(hiddenAllocationIds);

    if (labelAllowlist.size === 0) {
      console.warn(
        '[Vault allocation] Label allowlist is empty; API labels will be moved to Others',
      );
    }

    for (const alloc of apiData.allocations) {
      if (alloc.type === 'nested') {
        const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);
        // A subvault is not a summary entry itself, and its display threshold
        // is checked after its children have been parsed.
        const disposition = classifyAllocation(
          alloc,
          labelAllowlist,
          hiddenIds,
          { includeSummary: false, includeVisibility: false },
        );

        if (disposition.type === 'others') {
          moveAllocationToOthers(
            topLevelSummaryRows,
            alloc,
            tvlUSD,
            disposition.reason,
          );
          continue;
        }

        const group = parseNestedGroup(
          alloc,
          tvlUSD,
          labelAllowlist,
          hiddenIds,
          topLevelSummaryRows,
        );

        if (isVisible(group.allocation)) {
          groups.push(group);
        } else if (group.allocation > 0) {
          moveAllocationToOthers(
            topLevelSummaryRows,
            alloc,
            group.tvlUSD,
            'below-min-display-percent',
          );
        }
      } else {
        flatAllocations.push(alloc);
      }
    }

    const flatItems = parseFlatItems(
      flatAllocations,
      labelAllowlist,
      hiddenIds,
      topLevelSummaryRows,
    );
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
  }, [allocationLabelAllowlist, apiData, hiddenAllocationIds]);
};
