import { TooltipComponentFormatterCallbackParams } from 'echarts';
import { formatUnits } from 'viem';
import { LOCALE } from 'config/groups/locale';

import { shortenTokenValue } from 'utils/shortenTokenValue';
import {
  VAULT_CHART_COLOR,
  VAULT_CHART_AREA_COLOR,
  VAULT_CHART_SERIES_TVL_NAME,
  VAULT_CHART_SERIES_APY_NAME,
  TREASURY_CHART_LINE_COLOR,
  TREASURY_CHART_AREA_COLOR,
  TREASURY_CHART_SERIES_NAME,
  STAKING_CHART_LINE_COLOR,
  STAKING_CHART_AREA_COLOR,
  STAKING_CHART_SERIES_NAME,
  BASE_SERIES_OPTIONS,
} from './consts';

/** Format TVL using ECharts params (all series at this axis point). */
export const formatTvl = (amount: string) =>
  `$${shortenTokenValue(Number(formatUnits(BigInt(amount), 18)))}`;

/** Format date using ECharts params (all series at this axis point). */
const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/** Format tooltip using ECharts params (all series at this axis point). */
export const formatTooltipContent = (
  params: TooltipComponentFormatterCallbackParams,
  isTvl: boolean,
): string => {
  if (!Array.isArray(params) || params.length === 0) return '';
  const first = params[0];
  const [timestamp] = (first.value as [number, string | number]) ?? [];
  const lines = params.map(({ marker, seriesName, value }) => {
    const rawValue = (value as [number, string | number])[1];
    const formatted = isTvl
      ? formatTvl(rawValue as string)
      : `${Number(rawValue).toFixed(2)}%`;
    return `<div style="margin-bottom:4px">${marker}${seriesName}&nbsp;&nbsp;&nbsp;<b>${formatted}</b></div>`;
  });
  return `${formatDate(timestamp)}<div style="margin-top:8px">${lines.join('')}</div>`;
};

export const buildChartSeries = ({
  activeChart,
  seriesData,
  treasurySeriesData,
  stakingSeriesData,
  isUSDVault,
  isETHVault,
}: {
  activeChart: 'tvl' | 'apy';
  seriesData: [number, string | number][];
  treasurySeriesData: [number, number][];
  stakingSeriesData?: [number, number][];
  isUSDVault: boolean;
  isETHVault: boolean;
}) => {
  if (activeChart === 'tvl') {
    return [
      {
        ...BASE_SERIES_OPTIONS,
        name: VAULT_CHART_SERIES_TVL_NAME,
        data: seriesData,
        lineStyle: { color: VAULT_CHART_COLOR, width: 2 },
        itemStyle: { color: VAULT_CHART_COLOR },
        areaStyle: { color: VAULT_CHART_AREA_COLOR },
      },
    ];
  }
  const apySeries: Array<{
    name: string;
    data: [number, string | number][] | [number, number][];
    lineStyle: { color: string; width: number };
    itemStyle: { color: string };
    areaStyle?: { color: string };
    z?: number;
    smooth: number;
    showSymbol: boolean;
    symbol: 'circle';
    symbolSize: number;
    type: 'line';
  }> = [
    {
      ...BASE_SERIES_OPTIONS,
      z: 1,
      name: VAULT_CHART_SERIES_APY_NAME,
      data: seriesData,
      lineStyle: { color: VAULT_CHART_COLOR, width: 2 },
      itemStyle: { color: VAULT_CHART_COLOR },
      areaStyle: { color: VAULT_CHART_AREA_COLOR },
    },
  ];
  if (isUSDVault && treasurySeriesData.length > 0) {
    apySeries.push({
      ...BASE_SERIES_OPTIONS,
      z: 2,
      name: TREASURY_CHART_SERIES_NAME,
      data: treasurySeriesData,
      lineStyle: { color: TREASURY_CHART_LINE_COLOR, width: 2 },
      itemStyle: { color: TREASURY_CHART_LINE_COLOR },
      areaStyle: { color: TREASURY_CHART_AREA_COLOR },
    });
  }
  if (isETHVault && stakingSeriesData && stakingSeriesData.length > 0) {
    apySeries.push({
      ...BASE_SERIES_OPTIONS,
      z: 3,
      name: STAKING_CHART_SERIES_NAME,
      data: stakingSeriesData,
      lineStyle: { color: STAKING_CHART_LINE_COLOR, width: 2 },
      itemStyle: { color: STAKING_CHART_LINE_COLOR },
      areaStyle: { color: STAKING_CHART_AREA_COLOR },
    });
  }
  return apySeries;
};

/**
 * Maps each vault timestamp to the rate from a raw series on the same UTC calendar date.
 * Falls back to the nearest prior date when no exact match exists (weekends, US public holidays).
 *
 * Matching by UTC date (not by millisecond distance) avoids spurious day shifts that occur
 * when vault timestamps land late in the day (e.g. 23:00 UTC is closer to the next day's
 * midnight than to the current day's midnight).
 */
export const alignToVaultTimestamps = (
  raw: { timestampMs: number; rate: number }[],
  apySeriesData: number[][],
): [number, number][] => {
  if (raw.length === 0 || apySeriesData.length === 0) return [];

  // Build a map: UTC date string "YYYY-MM-DD" → rate for O(1) lookup.
  const dateToRate = new Map<string, number>();
  for (const point of raw) {
    const dateKey = new Date(point.timestampMs).toISOString().slice(0, 10);
    dateToRate.set(dateKey, point.rate);
  }

  // Sorted date keys for binary search fallback (nearest prior trading day).
  const sortedKeys = [...dateToRate.keys()].sort();

  return apySeriesData.map(([vaultTs]) => {
    const vaultDateKey = new Date(vaultTs).toISOString().slice(0, 10);

    const exactRate = dateToRate.get(vaultDateKey);
    if (exactRate !== undefined) {
      return [vaultTs, exactRate];
    }

    // No data for this UTC date (weekend / holiday): find nearest prior trading day.
    let left = 0;
    let right = sortedKeys.length - 1;
    while (left < right) {
      const mid = (left + right + 1) >> 1;
      if (sortedKeys[mid] <= vaultDateKey) left = mid;
      else right = mid - 1;
    }
    // sortedKeys is built from dateToRate.keys(), so the value is always defined.
    return [vaultTs, dateToRate.get(sortedKeys[left]) ?? 0];
  });
};
