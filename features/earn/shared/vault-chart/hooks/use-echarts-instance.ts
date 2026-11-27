import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import invariant from 'tiny-invariant';

export const useEChartsInstance = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // The chart node is always in the DOM, so the init runs once on mount
  useEffect(() => {
    invariant(chartRef.current, 'Chart container should be mounted');
    const chartContainer = chartRef.current;
    const chart = echarts.init(chartContainer, {}, { renderer: 'svg' });
    chartInstanceRef.current = chart;

    // ECharts fixes the size at init, so follow the container size
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartContainer);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  return { chartRef, chartInstanceRef };
};
