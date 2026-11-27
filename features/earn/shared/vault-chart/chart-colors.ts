import {
  CHART_COLOR_FALLBACKS,
  CHART_COLOR_TOKENS,
  type ChartColors,
} from './consts';

/** Reads the colour tokens through `readToken`. An empty value gives the light theme fallback. */
export const resolveChartColors = (
  readToken: (token: string) => string,
): ChartColors => {
  const keys = Object.keys(CHART_COLOR_TOKENS) as (keyof ChartColors)[];

  return keys.reduce<ChartColors>(
    (colors, key) => {
      const token = CHART_COLOR_TOKENS[key];
      const value = token ? readToken(token).trim() : '';
      return value ? { ...colors, [key]: value } : colors;
    },
    { ...CHART_COLOR_FALLBACKS },
  );
};

// The computed value of a custom property has all var() references replaced
export const readChartColors = (element: Element): ChartColors => {
  const style = getComputedStyle(element);
  return resolveChartColors((token) => style.getPropertyValue(token));
};
