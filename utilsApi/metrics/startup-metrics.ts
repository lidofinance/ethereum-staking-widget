import { Gauge, type Registry } from 'prom-client';
import { collectStartupMetrics as collectBuildInfoMetrics } from '@lidofinance/api-metrics';

import buildInfoJson from 'build-info.json';
import { config } from 'config';
import { METRICS_PREFIX } from 'consts/metrics';

const labelPairs = [
  { name: 'SELF_ORIGIN', value: process.env.SELF_ORIGIN },
  { name: 'ROOT_ORIGIN', value: process.env.ROOT_ORIGIN },
  { name: 'DOCS_ORIGIN', value: process.env.DOCS_ORIGIN },
  { name: 'HELP_ORIGIN', value: process.env.HELP_ORIGIN },
  { name: 'RESEARCH_ORIGIN', value: process.env.RESEARCH_ORIGIN },
  { name: 'SUPPORTED_CHAINS', value: process.env.SUPPORTED_CHAINS },
  { name: 'DEFAULT_CHAIN', value: process.env.DEFAULT_CHAIN },
  { name: 'CSP_TRUSTED_HOSTS', value: process.env.CSP_TRUSTED_HOSTS },
  { name: 'CSP_REPORT_ONLY', value: process.env.CSP_REPORT_ONLY },
  { name: 'CSP_REPORT_URI', value: process.env.CSP_REPORT_URI },
  { name: 'ENABLE_QA_HELPERS', value: process.env.ENABLE_QA_HELPERS },
  { name: 'REWARDS_BACKEND', value: process.env.REWARDS_BACKEND },
  { name: 'RATE_LIMIT', value: process.env.RATE_LIMIT },
  { name: 'RATE_LIMIT_TIME_FRAME', value: process.env.RATE_LIMIT_TIME_FRAME },
  { name: 'ETH_API_BASE_PATH', value: process.env.ETH_API_BASE_PATH },
  { name: 'WQ_API_BASE_PATH', value: process.env.WQ_API_BASE_PATH },
  { name: 'MATOMO_URL', value: process.env.MATOMO_URL },
  {
    name: 'WALLETCONNECT_PROJECT_ID',
    value: process.env.WALLETCONNECT_PROJECT_ID,
  },
  {
    name: 'REWARDS_BACKEND_BASE_PATH',
    value: process.env.REWARDS_BACKEND_BASE_PATH,
  },
];

export const collectStartupMetrics = (registry: Registry): void => {
  const envInfo = new Gauge({
    name: METRICS_PREFIX + 'env_info',
    help: 'Environment variables of the current runtime',
    labelNames: labelPairs.map((pair) => pair.name),
    registers: [registry],
  });
  envInfo.labels(...labelPairs.map((pair) => pair.value ?? '')).set(1);

  collectBuildInfoMetrics({
    prefix: METRICS_PREFIX,
    registry: registry,
    defaultChain: `${config.defaultChain}`,
    supportedChains: config.supportedChains.map((chain: number) => `${chain}`),
    version: buildInfoJson.version,
    commit: buildInfoJson.commit,
    branch: buildInfoJson.branch,
  });
};
