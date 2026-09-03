// Non-secret env keys, consumed by the api's `env_info` Prometheus gauge
// (server/src/metrics/index.ts). The Next-era boot-logging functions that
// lived here had no caller after the migration and were removed.
export const openKeys = [
  'SELF_ORIGIN',
  'ROOT_ORIGIN',
  'DOCS_ORIGIN',
  'HELP_ORIGIN',
  'RESEARCH_ORIGIN',
  'BLOG_ORIGIN',

  'BASE_PATH',
  'IPFS_MODE',
  'DEVNET_OVERRIDES',

  'SUPPORTED_CHAINS',
  'DEFAULT_CHAIN',
  'MANIFEST_OVERRIDE',

  'CSP_TRUSTED_HOSTS',
  'CSP_REPORT_ONLY',
  'CSP_REPORT_URI',

  'ENABLE_QA_HELPERS',
  'QA_GEO_COUNTRY',

  'REWARDS_BACKEND',
  'VALIDATION_SERVICE_BASE_PATH',

  'RATE_LIMIT',
  'RATE_LIMIT_TIME_FRAME',

  'ETH_API_BASE_PATH',
  'WQ_API_BASE_PATH',
  'MATOMO_URL',
  'WALLETCONNECT_PROJECT_ID',
  'REWARDS_BACKEND_BASE_PATH',
  'VALIDATION_FILE_PATH',
  'CONFIG_MANIFEST_PATH',
];
