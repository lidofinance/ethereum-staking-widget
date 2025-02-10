import { Gauge, type Registry } from 'prom-client';
import { collectStartupMetrics as collectBuildInfoMetrics } from '@lidofinance/api-metrics';

import buildInfoJson from 'build-info.json';
import { openKeys } from 'scripts/log-environment-variables.mjs';
import { getRPCChecks } from 'scripts/startup-checks/rpc.mjs';

import { config } from 'config';
import { METRICS_PREFIX } from 'consts/metrics';

import { StartupChecksRPCMetrics } from './startup-checks';

const collectStartupChecksRPCMetrics = async (
  registry: Registry,
): Promise<void> => {
  const rpcMetrics = new StartupChecksRPCMetrics(registry);

  try {
    // Await the promise if it's still in progress
    const rpcChecksResults = await getRPCChecks();

    if (!rpcChecksResults) {
      throw new Error(
        '[collectStartupChecksRPCMetrics] getRPCChecks resolved as "null"!',
      );
    }

    rpcChecksResults.forEach(
      (_check: { domain: string; chainId: number; success: boolean }) => {
        rpcMetrics.requestStatusGauge
          .labels({ rpc_domain: _check.domain, chain_id: _check.chainId })
          .set(Number(+!_check.success));
      },
    );
  } catch (error) {
    console.error(
      `[collectStartupChecksRPCMetrics] Error collecting RPC metrics: ${error}`,
    );
    rpcMetrics.requestStatusGauge
      .labels({ rpc_domain: 'BROKEN_URL' }) // false as string, chainId is not important here
      .inc(1);
  }
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

export const collectStartupMetrics = async (
  registry: Registry,
): Promise<void> => {
  if (!config.collectMetrics) return;

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

  await collectStartupChecksRPCMetrics(registry);
};
