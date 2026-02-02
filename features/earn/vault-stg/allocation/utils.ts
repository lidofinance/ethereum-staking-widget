import { AllocationItem as AllocationPosition } from 'features/earn/shared/vault-allocation/types';

import {
  ALLOCATION_PROTOCOL_IDS_KNOWN,
  ALLOCATION_ICONS_BY_ID,
  ALLOCATION_PENDING_ID,
  ALLOCATION_TOKEN_IDS_AVAILABLE,
  ALLOCATION_ITEM_DEFAULT,
  AllocationProtocolId,
} from './consts';

type FetchedPosition = {
  id: AllocationProtocolId | string;
  label: string;
  chain: string;
  sharePercent: number;
  tvl: { amount: string };
};

const calculateTvlUSD = (totalTvlUsd: number, sharePercent: number): number => {
  return (totalTvlUsd / 100) * sharePercent;
};

const createAllocationPosition = (
  position: FetchedPosition,
  totalTvlUsd: number,
): AllocationPosition => ({
  allocation: position.sharePercent,
  chain: position.chain,
  protocol: position.label,
  tvlETH: BigInt(position.tvl.amount),
  tvlUSD: calculateTvlUSD(totalTvlUsd, position.sharePercent),
  icon: ALLOCATION_ICONS_BY_ID[position.id as AllocationProtocolId],
});

type PositionCategory = 'known' | 'pending' | 'available' | 'other';

type CategorizedPosition = {
  item: AllocationPosition;
  category: PositionCategory;
};

const categorizePosition = (
  position: FetchedPosition,
  totalTvlUsd: number,
): CategorizedPosition => {
  const item = createAllocationPosition(position, totalTvlUsd);
  let category: PositionCategory = 'other';

  if (
    ALLOCATION_PROTOCOL_IDS_KNOWN.includes(position.id as AllocationProtocolId)
  ) {
    category = 'known';
  }

  if (position.id === ALLOCATION_PENDING_ID) {
    category = 'pending';
  }

  if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(position.id)) {
    category = 'available';
  }

  return {
    category,
    item,
  };
};

export const categorizePositions = (
  fetchedPositions: FetchedPosition[],
  totalTvlUsd: number,
) => {
  const known: AllocationPosition[] = [];
  let available: AllocationPosition = {
    ...ALLOCATION_ITEM_DEFAULT,
    protocol: 'Available',
  };
  let pending: AllocationPosition = { ...ALLOCATION_ITEM_DEFAULT };
  let other: AllocationPosition = { ...ALLOCATION_ITEM_DEFAULT };

  fetchedPositions.forEach((allocation) => {
    const categorizedAllocation = categorizePosition(allocation, totalTvlUsd);

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

export const buildPositionsArray = (
  categorized: ReturnType<typeof categorizePositions>,
): AllocationPosition[] => {
  const { known, available, pending, other } = categorized;
  const positions: AllocationPosition[] = [];

  known.sort((a, b) => b.allocation - a.allocation);

  if (known.length > 0) {
    positions.push(...known, available);
  }
  if (pending.allocation > 0) {
    positions.push(pending);
  }
  if (other.allocation > 0) {
    positions.push(other);
  }

  return positions;
};
