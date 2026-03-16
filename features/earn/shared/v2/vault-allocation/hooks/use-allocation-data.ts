import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { randomColor } from 'features/earn/shared/vault-allocation/utils';
import { MetavaultsAllocationFetchedData } from '../apy-data/metavaults-allocation';
import {
  AllocationGroup,
  AllocationTableData,
  FlatAllocationItem,
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
} from '../consts';

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
    let availableFlatAlloc = 0;
    let availableFlatTvl = 0;
    let pendingFlatAlloc = 0;
    let pendingFlatTvl = 0;
    let othersFlatAlloc = 0;
    let othersFlatTvl = 0;

    for (const alloc of apiData.allocations) {
      const tvlUSD = parseTvlUSD(alloc.tvl.usd, alloc.tvl.usd_decimals);

      if (alloc.type === 'nested') {
        let availableAlloc = 0;
        let availableTvl = 0;
        let pendingAlloc = 0;
        let pendingTvl = 0;
        let othersAlloc = 0;
        let othersTvl = 0;
        const knownItems = [];

        for (const sub of alloc.allocations) {
          const subTvl = tvlUSD * (sub.sharePercent / 100);

          if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(sub.id)) {
            availableAlloc += sub.sharePercent;
            availableTvl += subTvl;
          } else if (sub.id === ALLOCATION_PENDING_ID) {
            pendingAlloc += sub.sharePercent;
            pendingTvl += subTvl;
          } else if (
            !ALLOCATION_PROTOCOL_IDS_KNOWN.includes(
              sub.id as AllocationProtocolId,
            )
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

        if (availableAlloc > 0)
          knownItems.push({
            label: 'Available',
            id: 'available',
            icon: undefined,
            info: AVAILABLE_TIP,
            chain: '',
            allocation: availableAlloc,
            tvlUSD: availableTvl,
          });
        if (pendingAlloc > 0)
          knownItems.push({
            label: 'Pending',
            id: 'pending',
            icon: undefined,
            info: PENDING_TIP,
            chain: '',
            allocation: pendingAlloc,
            tvlUSD: pendingTvl,
          });
        if (othersAlloc > 0)
          knownItems.push({
            label: 'Others',
            id: 'others',
            icon: undefined,
            info: OTHER_TIP,
            chain: '',
            allocation: othersAlloc,
            tvlUSD: othersTvl,
          });

        groups.push({
          name: alloc.label,
          allocation: alloc.sharePercent,
          tvlUSD,
          items: knownItems.filter(
            (item) => Number((item.allocation / 100).toFixed(2)) > 0,
          ),
        });
      } else if (ALLOCATION_TOKEN_IDS_AVAILABLE.includes(alloc.id)) {
        availableFlatAlloc += alloc.sharePercent;
        availableFlatTvl += tvlUSD;
      } else if (alloc.id === ALLOCATION_PENDING_ID) {
        pendingFlatAlloc += alloc.sharePercent;
        pendingFlatTvl += tvlUSD;
      } else if (
        !ALLOCATION_PROTOCOL_IDS_KNOWN.includes(
          alloc.id as AllocationProtocolId,
        )
      ) {
        othersFlatAlloc += alloc.sharePercent;
        othersFlatTvl += tvlUSD;
      } else {
        flatItems.push({
          name: alloc.label,
          allocation: alloc.sharePercent,
          tvlUSD,
        });
      }
    }

    if (availableFlatAlloc > 0)
      flatItems.push({
        name: 'Available',
        info: AVAILABLE_TIP,
        allocation: availableFlatAlloc,
        tvlUSD: availableFlatTvl,
      });
    if (pendingFlatAlloc > 0)
      flatItems.push({
        name: 'Pending',
        info: PENDING_TIP,
        allocation: pendingFlatAlloc,
        tvlUSD: pendingFlatTvl,
      });
    if (othersFlatAlloc > 0)
      flatItems.push({
        name: 'Others',
        info: OTHER_TIP,
        allocation: othersFlatAlloc,
        tvlUSD: othersFlatTvl,
      });

    const filteredGroups = groups.filter(
      (item) => Number((item.allocation / 100).toFixed(2)) > 0,
    );
    const filteredFlatItems = flatItems.filter(
      (item) => Number((item.allocation / 100).toFixed(2)) > 0,
    );

    const allEntries = [...filteredGroups, ...filteredFlatItems];
    const totalTvlUsd = parseTvlUSD(
      apiData.totalTvl.usd,
      apiData.totalTvl.usd_decimals,
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
      lastUpdated: Number(apiData.lastUpdate),
      chartData,
      groups: filteredGroups,
      ...(flatItems.length > 0 && { flatItems: filteredFlatItems }),
      totalTvlUsd,
    };
  }, [apiData]);
};
