import { useQuery } from '@tanstack/react-query';
import { AllocationItem } from 'features/earn/shared/vault-allocation/types';
import { createAllocationsChartData } from 'features/earn/shared/vault-allocation/utils';
import { useSTGStats } from '../../hooks/use-stg-stats';

const ALLOCATION_PROTOCOL_IDS_KNOWN = [
  'aave-wsteth-weth',
  'aave-ethena',
  'spark-wsteth-weth',
];

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

export const useSTGAllocation = () => {
  const {
    apy,
    allocations: fetchedAllocations,
    lastUpdateTimestamp,
    totalTvlUsd,
    totalTvlWei,
    isLoading: isLoadingStats,
  } = useSTGStats();

  const allocation = useQuery({
    queryKey: ['stg', 'stats', 'allocation', fetchedAllocations],
    queryFn: async () => {
      const allocations: Array<AllocationItem> = [];
      const allocationsKnown: Array<AllocationItem> = [];

      const allocationAvailable: AllocationItem = {
        ...ALLOCATION_ITEM_DEFAULT,
        protocol: 'Available',
      };

      const allocationOther: AllocationItem = {
        ...ALLOCATION_ITEM_DEFAULT,
      };

      const allocationPending: AllocationItem = {
        ...ALLOCATION_ITEM_DEFAULT,
      };

      fetchedAllocations.forEach((allocation) => {
        if (ALLOCATION_PROTOCOL_IDS_KNOWN.includes(allocation.id)) {
          const currentItem: AllocationItem = {
            allocation: allocation.sharePercent,
            apy: 0, // not used in the allocations table? and is not available from the strategy API
            chain: allocation.chain,
            protocol: allocation.label,
            // TODO: ensure tvl.asset == ETH and tvl.decimals == 18 for the correct calculations
            tvlETH: BigInt(allocation.tvl.amount),
            tvlUSD: totalTvlUsd
              ? (totalTvlUsd / 100) * allocation.sharePercent
              : 0,
          };
          allocationsKnown.push(currentItem);
        } else if (allocation.id === ALLOCATION_PENDING_ID) {
          allocationPending.allocation += allocation.sharePercent;
          allocationPending.tvlETH += BigInt(allocation.tvl.amount);
          allocationPending.tvlUSD += totalTvlUsd
            ? (totalTvlUsd / 100) * allocation.sharePercent
            : 0;
          allocationPending.protocol = allocation.label;
        } else if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(allocation.id)) {
          allocationAvailable.allocation += allocation.sharePercent;
          allocationAvailable.tvlETH += BigInt(allocation.tvl.amount);
          allocationAvailable.tvlUSD += totalTvlUsd
            ? (totalTvlUsd / 100) * allocation.sharePercent
            : 0;
        } else {
          allocationOther.allocation += allocation.sharePercent;
          allocationOther.tvlETH += BigInt(allocation.tvl.amount);
          allocationOther.tvlUSD += totalTvlUsd
            ? (totalTvlUsd / 100) * allocation.sharePercent
            : 0;
        }
      });

      allocationsKnown.sort((a, b) => b.allocation - a.allocation);

      if (allocationsKnown.length > 0) {
        allocations.push(...allocationsKnown, allocationAvailable);
      }
      if (allocationPending && allocationPending.allocation > 0) {
        allocations.push(allocationPending);
      }
      if (allocationOther.allocation > 0) {
        allocations.push(allocationOther);
      }

      const chartData = createAllocationsChartData(allocations, 100);

      return {
        chartData,
        allocations,
        totalTvlUSD: totalTvlUsd ?? 0,
        totalTvlETH: totalTvlWei ?? 0n,
        lastUpdated: lastUpdateTimestamp ?? 0,
      };
    },
  });

  return {
    ...allocation,
    isLoading: isLoadingStats || allocation.isLoading,
    apy,
  };
};
