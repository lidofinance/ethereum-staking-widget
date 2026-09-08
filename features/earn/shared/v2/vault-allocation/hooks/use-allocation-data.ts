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
// Available / Pending / Others rows shown at the metavault level. Subvaults
// never carry summary rows of their own; their contributions are merged here.
const ALLOCATION_SUMMARY_KEYS = ['pending', 'others', 'available'] as const;
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

const logAllocationMovedToOthers = (
  id: string,
  reason: DiagnosticAllocationReason,
): void => {
  console.debug('[Vault allocation] Allocation moved to Others', {
    reason,
    id,
  });
};

// Takes an already whole-vault share; nested allocations must be rescaled
// first, so they roll up through `parseNestedGroup` instead of this helper.
const moveAllocationToOthers = (
  summaryRows: AllocationSummaryRows,
  allocation: DiagnosticAllocationData,
  tvlUSD: number,
  reason: DiagnosticAllocationReason,
): void => {
  logAllocationMovedToOthers(allocation.id, reason);

  if (allocation.sharePercent <= 0) return;

  addToAllocationSummaryRow(
    summaryRows,
    'others',
    allocation.sharePercent,
    tvlUSD,
  );
};

// Splits the displayable positions from the overflow. The caller rolls up the
// overflow, since only it knows how to rescale a nested share.
const limitNestedItems = (
  items: AllocationSubItem[],
): { items: AllocationSubItem[]; overflow: AllocationSubItem[] } => {
  items.sort(sortByAllocationDescending);

  return {
    items: items.slice(0, MAX_SUBVAULT_POSITIONS),
    overflow: items.slice(MAX_SUBVAULT_POSITIONS),
  };
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

const appendSummaryRows = (
  items: FlatAllocationItem[],
  summaryRows: AllocationSummaryRows,
): void => {
  for (const key of ALLOCATION_SUMMARY_KEYS) {
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
  const knownItems: AllocationSubItem[] = [];
  let rolledUpAllocation = 0;
  let rolledUpTvlUSD = 0;

  // Summary rows exist only at the metavault level, so every nested Available /
  // Pending / Others contribution is merged there instead of into the subvault.
  // Assumes a subvault's children sum to 100%, which the API schema does not
  // enforce; see NESTED_ALLOCATION_SCHEMA in ../apy-data/metavaults-allocation.
  const rollUpToMetavault = (
    key: AllocationSummaryKey,
    subSharePercent: number,
    subTvl: number,
  ): void => {
    if (subSharePercent <= 0) return;

    // A nested share is relative to its parent subvault. Convert it to the
    // whole-vault share before merging it into the metavault-level row.
    const topLevelShare = alloc.sharePercent * (subSharePercent / 100);

    addToAllocationSummaryRow(topLevelSummaryRows, key, topLevelShare, subTvl);
    rolledUpAllocation += topLevelShare;
    rolledUpTvlUSD += subTvl;
  };

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
      rollUpToMetavault(disposition.key, sub.sharePercent, subTvl);
    } else if (disposition.type === 'others') {
      logAllocationMovedToOthers(sub.id, disposition.reason);
      rollUpToMetavault('others', sub.sharePercent, subTvl);
    } else if (disposition.type === 'visible') {
      knownItems.push({
        label: sub.label,
        id: sub.id,
        icon: getAllocationProtocolIcon(sub.protocol, sub.id),
        chain: sub.chain,
        allocation: sub.sharePercent,
        tvlUSD: subTvl,
      });
    }
  }

  const { items, overflow } = limitNestedItems(knownItems);

  for (const item of overflow) {
    logAllocationMovedToOthers(item.id, 'max-subvault-positions');
    rollUpToMetavault('others', item.allocation, item.tvlUSD);
  }

  return {
    name: alloc.label,
    allocation: alloc.sharePercent - rolledUpAllocation,
    tvlUSD: tvlUSD - rolledUpTvlUSD,
    items,
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
        icon: getAllocationProtocolIcon(alloc.protocol, alloc.id),
        allocation: alloc.sharePercent,
        tvlUSD,
      });
    }
  }

  items.sort(sortByAllocationDescending);
  appendSummaryRows(items, summaryRows);

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
          // Only the share left after the roll-up, since the rolled-up part is
          // already counted in the metavault-level summary rows.
          moveAllocationToOthers(
            topLevelSummaryRows,
            { id: alloc.id, sharePercent: group.allocation },
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
