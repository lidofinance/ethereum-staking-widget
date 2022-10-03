export const METRICS_PREFIX = 'eth_stake_widget_ui_';

export enum METRIC_NAMES {
  REQUESTS_TOTAL = 'requests_total',
  API_RESPONSE = 'api_response',
  SUBGRAPHS_RESPONSE = 'subgraphs_response',
}

export const MEMORY_CACHE_METRICS = ['size', 'memsize'] as const;
