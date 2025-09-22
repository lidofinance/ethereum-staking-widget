import { type Address } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { LineData } from '@lidofinance/lido-ui';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { standardFetcher } from 'utils/standardFetcher';

import { getGGVVaultContract } from '../../contracts';
import { SevenSeasAPIPerformanceResponse } from '../../utils';
import { useGGVApy } from '../../hooks/use-ggv-stats';

type LineDataWithAllocation = LineData & { allocation: number };

type SevenSeasAPIDailyResponse = {
  Response: {
    block_number: number;
    daily_apy: number;
    price_usd: string;
    share_price: number;
    timestamp: string;
    total_assets: string;
    tvl: string;
    unix_seconds: number;
    vault_address: Address;
  }[];
};

const hslToHex = (h: number, s: number, l: number) => {
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
const randomColor = (index: number) => {
  const seed = (index + 1) * 137.508;
  const hue = seed % 360 | 0;

  const saturation = 65 + ((index * 5) % 30);
  const lightness = 45 + ((index * 7) % 20);

  return hslToHex(hue, saturation, lightness);
};

export const useGGVAllocation = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const apy = useGGVApy();

  const allocation = useQuery({
    queryKey: ['ggv', 'stats', 'allocation'],
    queryFn: async () => {
      const vault = getGGVVaultContract(publicClientMainnet);
      const performanceURL = `https://api.sevenseas.capital/performance/ethereum/${vault.address}`;
      // TODO: get timestamp from start of the last day
      const tvlURL = `https://api.sevenseas.capital/dailyData/all/${vault.address}/1757980800/latest`;

      const performanceData =
        await standardFetcher<SevenSeasAPIPerformanceResponse>(performanceURL);
      const tvlData = await standardFetcher<SevenSeasAPIDailyResponse>(tvlURL);

      const currentDayTvlData = tvlData.Response[0];
      const totalAssetsETH = Number(currentDayTvlData.total_assets); // базовый актив (WETH)
      const totalTvlUSD = Number(currentDayTvlData.tvl); // в долларах

      const totalAllocation =
        performanceData.Response.real_apy_breakdown.reduce(
          (acc, item) => acc + item.allocation,
          0,
        );
      const totalAllocationPercentage =
        Math.round(totalAllocation * 100 * 100) / 100;

      const reserveAllocation = 1 - totalAllocation;
      const reserveAllocationPercentage = 100 - totalAllocationPercentage;

      const reserve = {
        name: 'withdraw_reserve',
        allocation: reserveAllocationPercentage,
        tvlUSD: (totalTvlUSD * reserveAllocation) / 100,
        tvlETH: (totalAssetsETH * reserveAllocation) / 100,
      };

      const allocations = performanceData.Response.real_apy_breakdown
        .map((item) => {
          const allocation = Math.round(item.allocation * 100 * 100) / 100;
          return {
            ...item,
            allocation,
            apy: item.apy * 100,
            tvlETH: totalAssetsETH * item.allocation,
            tvlUSD: totalTvlUSD * item.allocation,
          };
        })
        .sort((a, b) => b.allocation - a.allocation);

      let currentValue = 0;
      const chartData: LineDataWithAllocation[] = allocations.map(
        (item, index) => {
          currentValue =
            item.allocation / totalAllocationPercentage + currentValue;

          const color = randomColor(index);
          return {
            color,
            threshold: {
              value: currentValue,
              color,
              label: `${item.protocol} (${item.chain})`,
              description: `${item.protocol} (${item.chain})`,
            },
            allocation: item.allocation,
          };
        },
      );

      chartData.push({
        color: randomColor(allocations.length),
        threshold: {
          value: reserveAllocation + currentValue,
          color: randomColor(allocations.length),
          label: 'Withdraw Reserve',
          description: 'Withdraw Reserve',
        },
        allocation: reserve.allocation,
      });
      allocations.push({
        ...reserve,
        apy: 0,
        chain: '',
        protocol: 'withdraw_reserve',
      });

      return {
        chartData,
        allocations,
        totalTvlUSD,
        totalTvlETH: totalAssetsETH,
      };
    },
  });

  return { ...allocation, apy: apy.data };
};
