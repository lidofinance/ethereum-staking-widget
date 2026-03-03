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
    return `${marker}${seriesName}&nbsp;&nbsp;&nbsp;<b>${formatted}</b>`;
  });
  return `${formatDate(timestamp)}<br/>${lines.join('<br/>')}`;
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
 * Maps each vault timestamp to the closest point from a pre-sorted raw series.
 * `raw` MUST be sorted by timestampMs ascending (Treasury and staking fetchers guarantee this).
 * Uses binary search: O(n log m) instead of O(n·m) linear scan.
 */
export const alignToVaultTimestamps = (
  raw: { timestampMs: number; rate: number }[],
  apySeriesData: number[][],
): [number, number][] => {
  if (raw.length === 0 || apySeriesData.length === 0) return [];

  return apySeriesData.map(([vaultTs]) => {
    // Binary search: find first index where raw[mid].timestampMs >= vaultTs.
    let left = 0;
    let right = raw.length - 1;
    while (left < right) {
      const mid = (left + right) >> 1;
      if (raw[mid].timestampMs < vaultTs) left = mid + 1;
      else right = mid;
    }
    // Compare left with left-1 to pick the truly closest point.
    const closest =
      left > 0 &&
      Math.abs(raw[left - 1].timestampMs - vaultTs) <
        Math.abs(raw[left].timestampMs - vaultTs)
        ? raw[left - 1]
        : raw[left];
    return [vaultTs, closest.rate];
  });
};
