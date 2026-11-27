import type { TooltipComponentFormatterCallbackParams } from 'echarts';
import type { LineSeriesOption } from 'echarts/charts';
import { LOCALE } from 'config/groups/locale';

import { getShortenedNumber } from 'shared/formatters/utils';
import {
  BASE_SERIES_OPTIONS,
  CHART_LINE_WIDTH,
  CHART_TIME_RANGE,
  CHART_TYPE,
  DAYS_BY_RANGE,
  LEGEND_COLORS,
  MS_PER_DAY,
  STAKING_CHART_SERIES_NAME,
  TREASURY_CHART_SERIES_NAME,
  type ChartColors,
  type ChartTimeRange,
  type ChartType,
} from './consts';

export type ChartPoint = [number, number] | [number, number, number];

/**
 * Format TVL for display.
 * For ETH vaults renders as "X ETH"; for USD vaults renders as "$X".
 */
export const formatTvl = (amount: number, isETH = false): string =>
  isETH
    ? `${getShortenedNumber(amount, '0')} ETH`
    : `$${getShortenedNumber(amount, '0')}`;

export const formatApy = (value: number): string =>
  `${Number(value).toFixed(2)}%`;

/** Format date+time for the tooltip header using the browser's local timezone. */
export const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  });

// Local timezone matches the tick positions (local midnight boundaries)
export const formatAxisDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
  });

export const formatYAxisLabel = (
  value: number,
  activeChart: ChartType,
  isETHVault: boolean,
): string =>
  activeChart === CHART_TYPE.tvl
    ? formatTvl(value, isETHVault)
    : formatApy(value);

/** Replaces the alpha of a hex or rgb colour. Other formats come back unchanged. */
export const withAlpha = (value: string, alpha: number): string => {
  const color = value.trim();
  const hex = color.match(/^#([0-9a-f]+)$/i)?.[1];
  if (hex && [3, 4, 6, 8].includes(hex.length)) {
    const full =
      hex.length <= 4
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex;
    const [r, g, b] = [0, 2, 4].map((index) =>
      parseInt(full.slice(index, index + 2), 16),
    );
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const rgb = color.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;

  return color;
};

const TOOLTIP_DOT_STYLE =
  'flex:none;width:8px;height:8px;border-radius:50%;background:';

const tooltipRow = (
  dotColor: string,
  label: string,
  value: string,
  subValue?: string,
) =>
  `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">` +
  // ECharts sets nowrap on the tooltip; a long series name must wrap, not overlap the value
  `<span style="display:flex;align-items:baseline;gap:6px;min-width:0;white-space:normal">` +
  `<span style="align-self:center;${TOOLTIP_DOT_STYLE}${dotColor}"></span>${label}</span>` +
  `<span style="flex:none;display:flex;flex-direction:column;align-items:flex-end;white-space:nowrap">` +
  `<span>${value}</span>` +
  (subValue
    ? `<span style="color:var(--lido-app-ui-color-text-tertiary)">${subValue}</span>`
    : '') +
  `</span></div>`;

/** Tooltip markup with Popover tokens. The HTML tooltip lives in the DOM, so var() works here. */
export const formatTooltipContent = (
  params: TooltipComponentFormatterCallbackParams,
  isTvl: boolean,
  isETHVault = false,
): string => {
  if (!Array.isArray(params) || params.length === 0) return '';
  const [timestamp] = (params[0].value as ChartPoint | undefined) ?? [];

  const rows = params.map(({ color, seriesName = '', value }) => {
    const [, rawValue, usdValue] = value as ChartPoint;
    const dotColor = typeof color === 'string' ? color : 'currentColor';

    if (!isTvl) return tooltipRow(dotColor, seriesName, formatApy(rawValue));

    return tooltipRow(
      dotColor,
      seriesName,
      formatTvl(rawValue, isETHVault),
      isETHVault && usdValue != null ? formatTvl(usdValue) : undefined,
    );
  });

  return (
    `<div style="display:flex;flex-direction:column;gap:8px;font-family:var(--lido-app-ui-font-family);font-size:12px;line-height:20px;letter-spacing:-0.14px;color:var(--lido-app-ui-color-text-default)">` +
    `<div style="color:var(--lido-app-ui-color-text-secondary)">${timestamp != null ? formatDate(timestamp) : ''}</div>` +
    `<div style="display:flex;flex-direction:column;gap:4px">${rows.join('')}</div>` +
    `</div>`
  );
};

const lineSeries = ({
  name,
  data,
  color,
  surface,
  z,
}: {
  name: string;
  data: ChartPoint[];
  color: string;
  surface: string;
  z: number;
}): LineSeriesOption => ({
  ...BASE_SERIES_OPTIONS,
  name,
  data,
  z,
  color,
  lineStyle: { color, width: CHART_LINE_WIDTH },
  // The hover point: a ring in the surface colour and a soft halo
  itemStyle: {
    color,
    borderColor: surface,
    borderWidth: 2,
    shadowColor: withAlpha(color, 0.35),
    shadowBlur: 10,
  },
  emphasis: { scale: false, lineStyle: { width: CHART_LINE_WIDTH } },
});

export type BuildChartSeriesProps = {
  activeChart: ChartType;
  vaultLabel: string;
  seriesData: ChartPoint[];
  treasurySeriesData: ChartPoint[];
  stakingSeriesData?: ChartPoint[];
  isUSDVault: boolean;
  isETHVault: boolean;
  colors: ChartColors;
};

export const buildChartSeries = ({
  activeChart,
  vaultLabel,
  seriesData,
  treasurySeriesData,
  stakingSeriesData,
  isUSDVault,
  isETHVault,
  colors,
}: BuildChartSeriesProps): LineSeriesOption[] => {
  if (activeChart === CHART_TYPE.tvl) {
    return [
      {
        ...lineSeries({
          name: `${vaultLabel} TVL`,
          data: seriesData,
          color: colors.vault,
          surface: colors.surface,
          z: 1,
        }),
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(colors.vault, 0.32) },
              { offset: 1, color: withAlpha(colors.vault, 0.1) },
            ],
          },
        },
      },
    ];
  }

  const apySeries = [
    lineSeries({
      name: `${vaultLabel} APY`,
      data: seriesData,
      color: colors.vault,
      surface: colors.surface,
      z: 1,
    }),
  ];
  if (isUSDVault && treasurySeriesData.length > 0) {
    apySeries.push(
      lineSeries({
        name: TREASURY_CHART_SERIES_NAME,
        data: treasurySeriesData,
        color: colors.treasury,
        surface: colors.surface,
        z: 2,
      }),
    );
  }
  if (isETHVault && stakingSeriesData && stakingSeriesData.length > 0) {
    apySeries.push(
      lineSeries({
        name: STAKING_CHART_SERIES_NAME,
        data: stakingSeriesData,
        color: colors.staking,
        surface: colors.surface,
        z: 3,
      }),
    );
  }
  return apySeries;
};

export type LegendItem = {
  key: string;
  label: string;
  color: string;
  /** null when the value is not known yet */
  values: string[] | null;
};

export type LatestValues = {
  apy?: number;
  stakingApy?: number;
  treasuryApy?: number;
  tvl?: number;
  tvlUsd?: number;
};

export const getLegendItems = ({
  activeChart,
  vaultLabel,
  isETHVault,
  latest,
}: {
  activeChart: ChartType;
  vaultLabel: string;
  isETHVault: boolean;
  latest: LatestValues;
}): LegendItem[] => {
  if (activeChart === CHART_TYPE.tvl) {
    const { tvl, tvlUsd } = latest;
    let values: string[] | null = null;
    if (tvl != null) {
      values = isETHVault
        ? [formatTvl(tvl, true), ...(tvlUsd != null ? [formatTvl(tvlUsd)] : [])]
        : [formatTvl(tvl)];
    }
    return [
      {
        key: 'vault',
        label: `${vaultLabel} TVL`,
        color: LEGEND_COLORS.vault,
        values,
      },
    ];
  }

  const comparison = isETHVault
    ? {
        key: 'staking',
        label: STAKING_CHART_SERIES_NAME,
        color: LEGEND_COLORS.staking,
        value: latest.stakingApy,
      }
    : {
        key: 'treasury',
        label: TREASURY_CHART_SERIES_NAME,
        color: LEGEND_COLORS.treasury,
        value: latest.treasuryApy,
      };

  return [
    {
      key: 'vault',
      label: `${vaultLabel} APY`,
      color: LEGEND_COLORS.vault,
      values: latest.apy != null ? [formatApy(latest.apy)] : null,
    },
    {
      key: comparison.key,
      label: comparison.label,
      color: comparison.color,
      values: comparison.value != null ? [formatApy(comparison.value)] : null,
    },
  ];
};

export const getLastPoint = (
  series: ChartPoint[] | number[][],
): number[] | undefined => series[series.length - 1];

export type RangeCutoffs = Record<Exclude<ChartTimeRange, 'All'>, number>;

export const getRangeCutoffs = (startOfTodayMs: number): RangeCutoffs => ({
  '1M': startOfTodayMs - MS_PER_DAY * DAYS_BY_RANGE['1M'],
  '3M': startOfTodayMs - MS_PER_DAY * DAYS_BY_RANGE['3M'],
});

/**
 * 3M makes sense only with data older than 1M.
 * "All" makes sense only when the history is longer than 3M:
 * the vault launched before the 3M cutoff, and the 3M data reaches that cutoff.
 */
export const getRangeAvailability = ({
  earliestTs,
  cutoffs,
  launchMs,
}: {
  earliestTs?: number;
  cutoffs: RangeCutoffs;
  launchMs: number;
}): { is3MAvailable: boolean; isAllAvailable: boolean } => {
  if (earliestTs == null)
    return { is3MAvailable: false, isAllAvailable: false };

  const is3MAvailable = earliestTs < cutoffs['1M'];
  // Daily points can start up to one day after the cutoff
  const reaches3MCutoff = earliestTs <= cutoffs['3M'] + MS_PER_DAY;

  return {
    is3MAvailable,
    isAllAvailable:
      is3MAvailable && launchMs < cutoffs['3M'] && reaches3MCutoff,
  };
};

export const filterByRange = <T extends number[]>(
  series: T[],
  range: ChartTimeRange,
  cutoffs: RangeCutoffs,
): T[] =>
  range === CHART_TIME_RANGE.All
    ? series
    : series.filter(([ts]) => ts >= cutoffs[range]);

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
