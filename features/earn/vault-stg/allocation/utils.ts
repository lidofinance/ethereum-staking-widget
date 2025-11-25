import { FunctionComponent } from 'react';
import { AllocationItem } from 'features/earn/shared/vault-allocation/types';
import { SparkIcon, AaveV3Icon } from 'assets/earn';

const ALLOCATION_PROTOCOL_IDS_KNOWN = [
  'aave-wsteth-weth',
  'aave-ethena',
  'spark-wsteth-weth',
];

const ALLOCATION_ICONS_BY_ID: { [key: string]: FunctionComponent } = {
  'aave-wsteth-weth': AaveV3Icon,
  'aave-ethena': AaveV3Icon,
  'spark-wsteth-weth': SparkIcon,
};

const ALLOCATION_PENDING_ID = 'pending-deposits';

// Assets which are not allocated yet
const ALLOCATION_TOKEN_IDS_AVAILABLE = ['eth', 'weth', 'wsteth'];

const ALLOCATION_ITEM_DEFAULT: AllocationItem = {
  allocation: 0,
  apy: 0,
  chain: 'other',
  protocol: 'Other allocation',
  tvlUSD: 0,
  tvlETH: 0n,
};

type FetchedAllocation = {
  id: string;
  label: string;
  chain: string;
  sharePercent: number;
  tvl: { amount: string };
};

const calculateTvlUSD = (totalTvlUsd: number, sharePercent: number): number => {
  return (totalTvlUsd / 100) * sharePercent;
};

const createAllocationItem = (
  allocation: FetchedAllocation,
  totalTvlUsd: number,
): AllocationItem => ({
  allocation: allocation.sharePercent,
  apy: 0,
  chain: allocation.chain,
  protocol: allocation.label,
  tvlETH: BigInt(allocation.tvl.amount),
  tvlUSD: calculateTvlUSD(totalTvlUsd, allocation.sharePercent),
  icon: ALLOCATION_ICONS_BY_ID[allocation.id],
});

const updateAggregatedAllocation = (
  item: AllocationItem,
  allocation: FetchedAllocation,
  totalTvlUsd: number,
): void => {
  item.allocation += allocation.sharePercent;
  item.tvlETH += BigInt(allocation.tvl.amount);
  item.tvlUSD += calculateTvlUSD(totalTvlUsd, allocation.sharePercent);
};

const categorizeAllocation = (
  allocation: FetchedAllocation,
  categories: {
    known: AllocationItem[];
    available: AllocationItem;
    pending: AllocationItem;
    other: AllocationItem;
  },
  totalTvlUsd: number,
): void => {
  if (ALLOCATION_PROTOCOL_IDS_KNOWN.includes(allocation.id)) {
    categories.known.push(createAllocationItem(allocation, totalTvlUsd));
    return;
  }

  if (allocation.id === ALLOCATION_PENDING_ID) {
    // "Pending" is a single allocation item and is fetched from the API as a single item
    categories.pending = createAllocationItem(allocation, totalTvlUsd);
    return;
  }

  if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(allocation.id)) {
    updateAggregatedAllocation(categories.available, allocation, totalTvlUsd);
    return;
  }

  updateAggregatedAllocation(categories.other, allocation, totalTvlUsd);
};

export const categorizeAllocations = (
  fetchedAllocations: FetchedAllocation[],
  totalTvlUsd: number,
) => {
  const known: AllocationItem[] = [];
  const available: AllocationItem = {
    ...ALLOCATION_ITEM_DEFAULT,
    protocol: 'Available',
  };
  const pending: AllocationItem = { ...ALLOCATION_ITEM_DEFAULT };
  const other: AllocationItem = { ...ALLOCATION_ITEM_DEFAULT };

  const categories = { known, available, pending, other };

  fetchedAllocations.forEach((allocation) => {
    categorizeAllocation(allocation, categories, totalTvlUsd);
  });

  return categories;
};

export const buildAllocationsArray = (
  categorized: ReturnType<typeof categorizeAllocations>,
): AllocationItem[] => {
  const { known, available, pending, other } = categorized;
  const allocations: AllocationItem[] = [];

  known.sort((a, b) => b.allocation - a.allocation);

  if (known.length > 0) {
    allocations.push(...known, available);
  }
  if (pending.allocation > 0) {
    allocations.push(pending);
  }
  if (other.allocation > 0) {
    allocations.push(other);
  }

  return allocations;
};
