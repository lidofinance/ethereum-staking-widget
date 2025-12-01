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
  chain: allocation.chain,
  protocol: allocation.label,
  tvlETH: BigInt(allocation.tvl.amount),
  tvlUSD: calculateTvlUSD(totalTvlUsd, allocation.sharePercent),
  icon: ALLOCATION_ICONS_BY_ID[allocation.id],
});

type AllocationCategory = 'known' | 'pending' | 'available' | 'other';

type CategorizedAllocation = {
  item: AllocationItem;
  category: AllocationCategory;
};

const categorizeAllocation = (
  allocation: FetchedAllocation,
  totalTvlUsd: number,
): CategorizedAllocation => {
  const item = createAllocationItem(allocation, totalTvlUsd);
  let category: AllocationCategory = 'other';

  if (ALLOCATION_PROTOCOL_IDS_KNOWN.includes(allocation.id)) {
    category = 'known';
  }

  if (allocation.id === ALLOCATION_PENDING_ID) {
    category = 'pending';
  }

  if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(allocation.id)) {
    category = 'available';
  }

  return {
    category,
    item,
  };
};

export const categorizeAllocations = (
  fetchedAllocations: FetchedAllocation[],
  totalTvlUsd: number,
) => {
  const known: AllocationItem[] = [];
  let available: AllocationItem = {
    ...ALLOCATION_ITEM_DEFAULT,
    protocol: 'Available',
  };
  let pending: AllocationItem = { ...ALLOCATION_ITEM_DEFAULT };
  let other: AllocationItem = { ...ALLOCATION_ITEM_DEFAULT };

  fetchedAllocations.forEach((allocation) => {
    const categorizedAllocation = categorizeAllocation(allocation, totalTvlUsd);

    switch (categorizedAllocation.category) {
      case 'known':
        known.push(categorizedAllocation.item);
        break;
      case 'pending':
        pending = categorizedAllocation.item;
        break;
      case 'available':
        available = {
          ...available,
          allocation:
            available.allocation + categorizedAllocation.item.allocation,
          tvlETH: available.tvlETH + categorizedAllocation.item.tvlETH,
          tvlUSD: available.tvlUSD + categorizedAllocation.item.tvlUSD,
        };
        break;
      case 'other':
        other = {
          ...other,
          allocation: other.allocation + categorizedAllocation.item.allocation,
          tvlETH: other.tvlETH + categorizedAllocation.item.tvlETH,
          tvlUSD: other.tvlUSD + categorizedAllocation.item.tvlUSD,
        };
        break;
    }
  });

  return { known, available, pending, other };
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
