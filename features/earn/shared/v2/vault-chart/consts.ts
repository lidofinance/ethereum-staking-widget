/** US Treasury Daily Interest Rate XML Feed (yield curve). */
export const TREASURY_YIELD_CURVE_ORIGIN =
  'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml';

export const SECONDS_PER_DAY = 60 * 60 * 24;
export const DAYS_BY_RANGE: Record<string, number> = { '1M': 30, '3M': 90 };

export const METAVAULT_QUERY_SCOPE = 'earn-metavault';
export const VAULT_CHART_COLOR = '#0085FF';
export const VAULT_CHART_AREA_COLOR = 'rgba(0, 133, 255, 0.1)';
export const VAULT_CHART_SERIES_TVL_NAME = 'Vault TVL';
export const VAULT_CHART_SERIES_APY_NAME = 'Vault APY';

export const TREASURY_CHART_LINE_COLOR = '#00C2D1';
export const TREASURY_CHART_AREA_COLOR = 'rgba(0, 194, 209, 0.2)';
export const TREASURY_CHART_SERIES_NAME = 'US Treasury Bonds APY';
export const TREASURY_CHART_QUERY_SCOPE = 'treasury-chart-data';

export const STAKING_CHART_QUERY_SCOPE = 'staking-chart-data';
export const STAKING_CHART_LINE_COLOR = '#FF8D28';
export const STAKING_CHART_AREA_COLOR = 'rgba(255, 141, 40, 0.2)';
export const STAKING_CHART_SERIES_NAME = 'Staking APY';

export const BASE_SERIES_OPTIONS = {
  smooth: 0.3,
  showSymbol: false,
  symbol: 'circle' as const,
  symbolSize: 4,
  type: 'line' as const,
};
