import { useQuery } from '@tanstack/react-query';
import { LineData } from '@lidofinance/lido-ui';

import { useMainnetOnlyWagmi } from 'modules/web3';
import { standardFetcher } from 'utils/standardFetcher';

import { getGGVVaultContract } from '../../contracts';
import { SevenSeasAPIPerformanceResponse } from '../../utils';
import { useGGVApy } from '../../hooks/use-ggv-stats';

type LineDataWithAllocation = LineData & { allocation: number };

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
      const url = `https://api.sevenseas.capital/performance/ethereum/${vault.address}`;

      const data = await standardFetcher<SevenSeasAPIPerformanceResponse>(url);

      const totalAllocation = data.Response.real_apy_breakdown.reduce(
        (acc, item) => acc + item.allocation,
        0,
      );
      const allocations = data.Response.real_apy_breakdown
        .map((item) => ({
          ...item,
          allocation: Number((item.allocation * 100).toFixed(2)),
          apy: item.apy * 100,
          tvl: 0, // TODO: add tvl
        }))
        .sort((a, b) => b.allocation - a.allocation);

      let currentValue = 0;
      const chartData: LineDataWithAllocation[] = allocations.map(
        (item, index) => {
          currentValue = item.allocation / totalAllocation + currentValue;

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

      return {
        chartData,
        allocations,
        totalTVL: 0, // TODO: add tvl
      };
    },
  });

  return { ...allocation, apy: apy.data };
};
