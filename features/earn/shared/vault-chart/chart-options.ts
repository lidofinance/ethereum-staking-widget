import type { TooltipComponentFormatterCallbackParams } from 'echarts';
import type { LineSeriesOption } from 'echarts/charts';
import type { EChartsCoreOption } from 'echarts/core';

import {
  CHART_TYPE,
  MS_PER_DAY,
  type ChartColors,
  type ChartType,
} from './consts';
import {
  formatAxisDate,
  formatTooltipContent,
  formatYAxisLabel,
} from './utils';

// Canvas text measuring does not understand var(), so the font is a plain value
const CHART_FONT_FAMILY =
  'Manrope, -apple-system, BlinkMacSystemFont, sans-serif';
const TOOLTIP_WIDTH = 180;
const TOOLTIP_OFFSET = 16;

type TooltipSize = { contentSize: number[]; viewSize: number[] };

/** The design puts the tooltip under the point, with its right edge at the point. */
export const getTooltipPosition = (
  point: number[],
  { contentSize, viewSize }: TooltipSize,
): [number, number] => {
  const [x, y] = point;
  const [width, height] = contentSize;
  const [viewWidth, viewHeight] = viewSize;

  const left = x - width >= 0 ? x - width : Math.min(x, viewWidth - width);
  const below = y + TOOLTIP_OFFSET;
  const top =
    below + height <= viewHeight ? below : y - height - TOOLTIP_OFFSET;

  return [Math.max(left, 0), Math.max(top, 0)];
};

export type BuildChartOptionProps = {
  activeChart: ChartType;
  isETHVault: boolean;
  colors: ChartColors;
  series: LineSeriesOption[];
};

export const buildChartOption = ({
  activeChart,
  isETHVault,
  colors,
  series,
}: BuildChartOptionProps): EChartsCoreOption => {
  const isTvl = activeChart === CHART_TYPE.tvl;
  const axisLabelStyle = {
    color: colors.textTertiary,
    fontFamily: CHART_FONT_FAMILY,
    fontSize: 12,
    fontWeight: 400,
  };

  return {
    animation: false,
    // The grid shrinks so that the y labels on the right stay inside the chart
    grid: {
      left: 0,
      right: 0,
      top: 24,
      bottom: 0,
      outerBoundsMode: 'same',
      outerBoundsContain: 'axisLabel',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'none' },
      confine: true,
      // ECharts passes the sizes as the 5th argument
      position: (
        point: number[],
        _params: unknown,
        _dom: unknown,
        _rect: unknown,
        size: TooltipSize,
      ) => getTooltipPosition(point, size),
      formatter: (params: TooltipComponentFormatterCallbackParams) =>
        formatTooltipContent(params, isTvl, isETHVault),
      padding: 12,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      textStyle: { fontFamily: CHART_FONT_FAMILY, fontSize: 12 },
      // Popover look. This CSS is on an HTML element, so var() works.
      extraCssText: `width:${TOOLTIP_WIDTH}px;box-sizing:border-box;border-radius:var(--lido-app-ui-border-radius-lg);box-shadow:var(--lido-app-ui-shadow-default);`,
    },
    xAxis: {
      type: 'time', // timestamps come from series.data[][0]
      // Without minInterval, users with a large UTC offset can get two ticks
      // per calendar day (local midnight + UTC midnight) with the same label.
      minInterval: MS_PER_DAY,
      axisLine: { show: true, lineStyle: { color: colors.border, width: 1 } },
      axisTick: { show: true, length: 4, lineStyle: { color: colors.border } },
      splitLine: { show: false },
      axisLabel: {
        ...axisLabelStyle,
        lineHeight: 18,
        margin: 6,
        hideOverlap: true,
        formatter: (value: number) => formatAxisDate(value),
      },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      splitNumber: isTvl ? 4 : 2,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        ...axisLabelStyle,
        lineHeight: 20,
        margin: 16,
        // The x baseline marks zero
        showMinLabel: false,
        formatter: (value: number) =>
          formatYAxisLabel(value, activeChart, isETHVault),
      },
      splitLine: {
        lineStyle: { color: colors.border, width: 1, type: [1, 1] },
      },
    },
    series,
  };
};
