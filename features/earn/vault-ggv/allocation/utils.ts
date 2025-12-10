import { parseEther } from 'viem';

import { AllocationItem } from 'features/earn/shared/vault-allocation';

import {
  AaveV3Icon,
  BalancerIcon,
  EtherfiIcon,
  EulerIcon,
  MerklIcon,
  MorphoIcon,
  Univ3Icon,
  YearnV3Icon,
  FluidIcon,
} from 'assets/earn';

import {
  SevenSeasAPIPerformanceResponse,
  SevenSeasAPIDailyResponseItem,
} from '../utils';

const SCALE_FACTOR = 1_000_000_000_000_000; // 10^15

export const multiplyBigIntWithFloat = (
  big: bigint,
  float: number,
  scale = SCALE_FACTOR,
): bigint => {
  const factorInt = BigInt(Math.round(float * scale));
  return (big * factorInt) / BigInt(scale);
};

const ALLOCATION_PROTOCOL_NAMES_MAP = {
  aavev3: 'Aave V3',
  euler: 'Euler',
  morpho: 'Morpho',
  univ3: 'Uniswap V3',
  balancer: 'Balancer',
  merkl: 'Merkl',
  etherfi: 'ether.fi',
  yearn: 'Yearn V3',
  fluid: 'Fluid',
  other: 'Other allocation',
  available: 'Available',
};
const ALLOCATION_CHAIN_NAMES_MAP = {
  ethereum: 'Ethereum',
  base: 'Base',
  arbitrum: 'Arbitrum',
  linea: 'Linea',
  katana: 'Katana',
  other: 'Other',
};
const ALLOCATION_ICONS_MAP = {
  aavev3: AaveV3Icon,
  euler: EulerIcon,
  morpho: MorphoIcon,
  univ3: Univ3Icon,
  balancer: BalancerIcon,
  merkl: MerklIcon,
  etherfi: EtherfiIcon,
  yearn: YearnV3Icon,
  fluid: FluidIcon,
};

export const getTvlByAllocationsTimestamp = (
  tvlData: SevenSeasAPIDailyResponseItem[],
  allocationsTimestamp: string,
) => {
  const targetDate = new Date(allocationsTimestamp);

  // 1) try exact match by original string
  const tvlByAllocationsTimestamp = tvlData.find(
    (item) => item.timestamp === allocationsTimestamp,
  );
  if (tvlByAllocationsTimestamp) return tvlByAllocationsTimestamp;

  // 2) try match by calendar date (UTC)
  const tvlByAllocationsTimestampByDate = tvlData.find((item) => {
    const d = new Date(item.timestamp);
    return (
      d.getUTCFullYear() === targetDate.getUTCFullYear() &&
      d.getUTCMonth() === targetDate.getUTCMonth() &&
      d.getUTCDate() === targetDate.getUTCDate()
    );
  });
  if (tvlByAllocationsTimestampByDate) return tvlByAllocationsTimestampByDate;

  // 3) nearest point by time, if day is not found (with window limit)
  const targetUnix = Math.floor(targetDate.getTime() / 1000);
  const nearest = tvlData.reduce(
    (best, curr) => {
      const diff = Math.abs(curr.unix_seconds - targetUnix);
      if (best === null || diff < best.diff) {
        return { item: curr, diff };
      }
      return best;
    },
    null as null | { item: SevenSeasAPIDailyResponseItem; diff: number },
  );

  // allow maximum 2 day spread
  if (nearest && nearest.diff <= 2 * 86400) {
    const tvlByAllocationsTimestampNearest = nearest.item;

    return tvlByAllocationsTimestampNearest;
  }

  throw new Error('[GGV-ALLOCATION] No data found');
};

export const getAllocationData = (
  tvlData: SevenSeasAPIDailyResponseItem[],
  performanceData: SevenSeasAPIPerformanceResponse,
  latestAnswer: bigint,
  decimals: number,
) => {
  const allocationsTimestamp = performanceData.Response.timestamp;
  const tvlByAllocationsTimestamp = getTvlByAllocationsTimestamp(
    tvlData,
    allocationsTimestamp,
  );

  if (!tvlByAllocationsTimestamp) {
    throw new Error('[GGV-ALLOCATION] No data found');
  }

  const totalTvlWei = parseEther(tvlByAllocationsTimestamp.total_assets);
  const totalTvlUSDBigInt =
    (totalTvlWei * latestAnswer) / 10n ** (BigInt(decimals) + 18n - 4n);
  const totalTvlUsd = Number(totalTvlUSDBigInt) / 10 ** 4;

  const totalAllocation = performanceData.Response.real_apy_breakdown.reduce(
    (acc, item) => acc + item.allocation,
    0,
  );
  const totalAllocationPercentage =
    Math.round(Number(totalAllocation) * 100 * 100) / 100;

  const reserveAllocation = 1 - totalAllocation;
  const reserveAllocationPercentage = 100 - totalAllocationPercentage;

  const lastUpdated = tvlByAllocationsTimestamp.unix_seconds;

  return {
    totalTvlUsd,
    totalTvlUSDBigInt,
    totalTvlWei,
    reserveAllocation,
    reserveAllocationPercentage,
    totalAllocationPercentage,
    lastUpdated,
  };
};

export const createAllocationsData = (
  reserveAllocationPercentage: number,
  totalTvlUSDBigInt: bigint,
  totalAssetsETH: bigint,
  reserveAllocation: number,
  realApyBreakdown: SevenSeasAPIPerformanceResponse['Response']['real_apy_breakdown'],
) => {
  const reserve = {
    name: ALLOCATION_PROTOCOL_NAMES_MAP.available,
    allocation: reserveAllocationPercentage,
    tvlUSD:
      Number(multiplyBigIntWithFloat(totalTvlUSDBigInt, reserveAllocation)) /
      10 ** 4,
    tvlETH: multiplyBigIntWithFloat(totalAssetsETH, reserveAllocation),
  };
  const otherAllocations: AllocationItem = {
    allocation: 0,
    chain: ALLOCATION_CHAIN_NAMES_MAP.other,
    protocol: ALLOCATION_PROTOCOL_NAMES_MAP.other,
    tvlUSD: 0,
    tvlETH: 0n,
  };

  const allocations = realApyBreakdown
    .reduce((acc, item) => {
      const allocation = Math.round(item.allocation * 100 * 100) / 100;
      const isUnknown =
        !ALLOCATION_PROTOCOL_NAMES_MAP[
          item.protocol as keyof typeof ALLOCATION_PROTOCOL_NAMES_MAP
        ];

      if (isUnknown) {
        otherAllocations.allocation += allocation;
        otherAllocations.tvlETH += multiplyBigIntWithFloat(
          totalAssetsETH,
          item.allocation,
        );
        otherAllocations.tvlUSD +=
          Number(multiplyBigIntWithFloat(totalTvlUSDBigInt, item.allocation)) /
          10 ** 4;

        return acc;
      }

      const currentItem = {
        ...item,
        allocation,
        tvlETH: multiplyBigIntWithFloat(totalAssetsETH, item.allocation),
        tvlUSD:
          Number(multiplyBigIntWithFloat(totalTvlUSDBigInt, item.allocation)) /
          10 ** 4,
        protocol:
          ALLOCATION_PROTOCOL_NAMES_MAP[
            item.protocol as keyof typeof ALLOCATION_PROTOCOL_NAMES_MAP
          ],
        chain:
          ALLOCATION_CHAIN_NAMES_MAP[
            item.chain as keyof typeof ALLOCATION_CHAIN_NAMES_MAP
          ],
        icon: ALLOCATION_ICONS_MAP[
          item.protocol as keyof typeof ALLOCATION_ICONS_MAP
        ],
      };

      acc.push(currentItem);

      return acc;
    }, [] as AllocationItem[])
    .sort((a, b) => b.allocation - a.allocation);

  if (otherAllocations.allocation > 0) {
    allocations.push(otherAllocations);
  }

  allocations.push({
    ...reserve,
    chain: '',
    protocol: ALLOCATION_PROTOCOL_NAMES_MAP.available,
  });

  return allocations;
};
