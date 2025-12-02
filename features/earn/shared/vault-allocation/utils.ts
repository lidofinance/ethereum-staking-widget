import { AllocationItem, LineDataWithAllocation } from './types';
import { LOCALE } from 'config/groups/locale';

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

export const formatLastUpdatedDate = (timestamp: number | undefined) => {
  if (!timestamp) return 'N/A';
  return new Date(Number(timestamp) * 1000).toLocaleString(LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  });
};
