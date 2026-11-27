/** US Treasury Daily Interest Rate XML Feed (yield curve). */
export const TREASURY_YIELD_CURVE_ORIGIN =
  'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml';

export const METAVAULT_CHART_ORIGIN = 'https://api.mellow.finance';

// The first day of data for EarnETH and EarnUSD (10 March 2026)
export const VAULT_LAUNCH_TIMESTAMP = 1773100800;

export const SECONDS_PER_DAY = 60 * 60 * 24;
export const MS_PER_DAY = SECONDS_PER_DAY * 1000;

export const CHART_TIME_RANGE = {
  '1M': '1M',
  '3M': '3M',
  All: 'All',
} as const;
export type ChartTimeRange = keyof typeof CHART_TIME_RANGE;

export const CHART_TYPE = {
  apy: 'apy',
  tvl: 'tvl',
} as const;
export type ChartType = keyof typeof CHART_TYPE;

export const DAYS_BY_RANGE = { '1M': 30, '3M': 90 } as const;

export const METAVAULT_QUERY_SCOPE = 'earn-metavault';
export const TREASURY_CHART_QUERY_SCOPE = 'treasury-chart-data';
export const STAKING_CHART_QUERY_SCOPE = 'staking-chart-data';

export type VaultName = 'ethVault' | 'usdVault';

export const VAULT_LABEL: Record<VaultName, string> = {
  ethVault: 'EarnETH',
  usdVault: 'EarnUSD',
};

export const TREASURY_CHART_SERIES_NAME = 'US Treasury Bonds APY';
export const STAKING_CHART_SERIES_NAME = 'Staking APY';

export type ChartColors = {
  vault: string;
  staking: string;
  treasury: string;
  border: string;
  textTertiary: string;
  surface: string;
};

// ECharts writes colours into SVG attributes, so it needs real values, not var().
export const CHART_COLOR_TOKENS: Record<keyof ChartColors, string | null> = {
  vault: '--lido-app-ui-color-icons-active',
  staking: '--lido-app-ui-color-icons-warning',
  // The library has no cyan token. The icons-light-blue token is too close to the vault blue.
  treasury: null,
  border: '--lido-app-ui-color-border-default',
  textTertiary: '--lido-app-ui-color-text-tertiary',
  surface: '--lido-app-ui-color-background-surface',
};

// Light theme values, for the first render and for a missing token
export const CHART_COLOR_FALLBACKS: ChartColors = {
  vault: '#0085ff',
  staking: '#fa9200',
  treasury: '#00c2d1',
  border: '#0c0c0d1a',
  textTertiary: '#0c0c0d66',
  surface: '#ffffff',
};

// CSS values for the HTML legend, where var() works
export const LEGEND_COLORS = {
  vault: 'var(--lido-app-ui-color-icons-active)',
  staking: 'var(--lido-app-ui-color-icons-warning)',
  treasury: CHART_COLOR_FALLBACKS.treasury,
} as const;

export const CHART_LINE_WIDTH = 1.6;

export const BASE_SERIES_OPTIONS = {
  type: 'line' as const,
  smooth: 0.3,
  showSymbol: false,
  symbol: 'circle' as const,
  // 8px with a 2px centred border gives a 6px dot with a 2px ring
  symbolSize: 8,
};
