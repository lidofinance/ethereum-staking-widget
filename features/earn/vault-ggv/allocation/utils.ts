import { parseEther } from 'viem';

import {
  AllocationItem,
  LineDataWithAllocation,
} from 'features/earn/shared/vault-allocation';

import {
  SevenSeasAPIPerformanceResponse,
  SevenSeasAPIDailyResponseItem,
} from '../utils';

export const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const randomColor = (index: number) => {
  const seed = (index + 1) * 137.508;
  const hue = seed % 360 | 0;

  const saturation = 65 + ((index * 5) % 30);
  const lightness = 45 + ((index * 7) % 20);

  return hslToHex(hue, saturation, lightness);
};

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
  other: 'Other allocation',
  available: 'Available',
};
const ALLOCATION_CHAIN_NAMES_MAP = {
  ethereum: 'Ethereum',
  base: 'Base',
  arbitrum: 'Arbitrum',
  other: 'Other',
};

export const getAllocationData = (
  tvlData: SevenSeasAPIDailyResponseItem,
  performanceData: SevenSeasAPIPerformanceResponse,
  latestAnswer: bigint,
  decimals: number,
) => {
  const totalAssetsETH = parseEther(tvlData.total_assets);
  const totalTvlUSDBigInt =
    (totalAssetsETH * latestAnswer) / 10n ** (BigInt(decimals) + 18n - 4n);
  const totalTvlUSD = Number(totalTvlUSDBigInt) / 10 ** 4;

  const totalAllocation = performanceData.Response.real_apy_breakdown.reduce(
    (acc, item) => acc + item.allocation,
    0,
  );
  const totalAllocationPercentage =
    Math.round(Number(totalAllocation) * 100 * 100) / 100;

  const reserveAllocation = 1 - totalAllocation;
  const reserveAllocationPercentage = 100 - totalAllocationPercentage;

  const lastUpdated = tvlData.unix_seconds;

  return {
    totalTvlUSD,
    totalTvlUSDBigInt,
    totalAssetsETH,
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
    apy: 0,
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
        otherAllocations.apy += item.apy * 100;
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
        apy: item.apy * 100,
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
    apy: 0,
    chain: '',
    protocol: ALLOCATION_PROTOCOL_NAMES_MAP.available,
  });

  return allocations;
};

export const createAllocationsChartData = (
  allocations: AllocationItem[],
  totalAllocationPercentage: number,
) => {
  let currentValue = 0;
  const chartData: LineDataWithAllocation[] = allocations.map((item, index) => {
    currentValue = item.allocation / totalAllocationPercentage + currentValue;

    const color = randomColor(index);
    const description = item.chain
      ? `${item.protocol} (${item.chain})`
      : item.protocol;
    return {
      color,
      threshold: {
        value: currentValue,
        color,
        label: description,
        description: description,
      },
      allocation: item.allocation,
    };
  });

  return chartData;
};
