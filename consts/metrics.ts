export const METRICS_PREFIX = 'eth_stake_widget_ui_';

export const enum METRIC_NAMES {
  REQUESTS_TOTAL = 'requests_total',
  STARTUP_CHECKS_RPC_FAILED = 'startup_checks_rpc_failed',
  API_RESPONSE = 'api_response',
  ETH_CALL_ADDRESS_TO = 'eth_call_address_to',
  SSR_COUNT = 'ssr_count',
  VALIDATION_FILE_LOAD_ERROR = 'validation_file_load_error',
  CONFIG_MANIFEST_LOAD_ERROR = 'config_manifest_load_error',
  PORTFOLIO_UPSTREAM_CALLS = 'portfolio_upstream_calls_total',
  PORTFOLIO_UPSTREAM_REJECTED = 'portfolio_upstream_rejected_total',
  PORTFOLIO_CLIENT_LIMITED = 'portfolio_client_limited_total',
  PORTFOLIO_STALE_SERVED = 'portfolio_stale_served_total',
  PORTFOLIO_REQUESTS = 'portfolio_requests_total',
}
