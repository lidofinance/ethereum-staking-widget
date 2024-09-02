import { Gauge, type Registry } from 'prom-client';
import { collectStartupMetrics as collectBuildInfoMetrics } from '@lidofinance/api-metrics';

import buildInfoJson from 'build-info.json';
import { openKeys } from 'scripts/log-environment-variables.mjs';
import { getRPCCheckResults } from 'scripts/startup-checks/rpc.mjs';

import { config } from 'config';
import { METRICS_PREFIX } from 'consts/metrics';
import { StartupChecksRPCMetrics } from './startup-checks';

const collectStartupChecksRPCMetrics = (registry: Registry): void => {
  const rpcMetrics = new StartupChecksRPCMetrics(registry);

  getRPCCheckResults().forEach(
    (_check: { domain: string; success: boolean }) => {
      rpcMetrics.requestCounter
        .labels(_check.domain, _check.success.toString())
        .inc();
    },
  );
};

const collectEnvInfoMetrics = (registry: Registry): void => {
  const labelPairs = openKeys.map((key) => ({
    name: key,
    value: process.env[key] ?? '',
  }));

  const envInfo = new Gauge({
    name: METRICS_PREFIX + 'env_info',
    help: 'Environment variables of the current runtime',
    labelNames: labelPairs.map((pair) => pair.name),
    registers: [registry],
  });
  envInfo.labels(...labelPairs.map((pair) => pair.value)).set(1);
};

export const collectStartupMetrics = (registry: Registry): void => {
  collectEnvInfoMetrics(registry);

  collectBuildInfoMetrics({
    prefix: METRICS_PREFIX,
    registry: registry,
    defaultChain: `${config.defaultChain}`,
    supportedChains: config.supportedChains.map((chain: number) => `${chain}`),
    version: buildInfoJson.version,
    commit: buildInfoJson.commit,
    branch: buildInfoJson.branch,
  });

  collectStartupChecksRPCMetrics(registry);
};
