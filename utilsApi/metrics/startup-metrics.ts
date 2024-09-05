import { Gauge, type Registry } from 'prom-client';
import { collectStartupMetrics as collectBuildInfoMetrics } from '@lidofinance/api-metrics';

import buildInfoJson from 'build-info.json';
import { openKeys } from 'scripts/log-environment-variables.mjs';
import {
  getRPCChecks,
  MAX_RETRY_COUNT,
  RETRY_WAIT_TIME_MS,
  STATUS_FINISHED,
} from 'scripts/startup-checks/rpc.mjs';

import { config, secretConfig } from 'config';
import { METRICS_PREFIX } from 'consts/metrics';

import { StartupChecksRPCMetrics } from './startup-checks';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryGetRPCChecks = async (maxAttempts: number, delay: number) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const rpcCheckStatus = getRPCChecks();

    if (rpcCheckStatus.status === STATUS_FINISHED) {
      return rpcCheckStatus.results;
    }

    console.info(
      `[collectStartupChecksRPCMetrics] Waiting for RPC checks to finish. Attempt ${attempts + 1}.`,
    );

    await sleep(delay);
    attempts += 1;
  }

  throw new Error(
    `[collectStartupChecksRPCMetrics] RPC check results did not finish after ${maxAttempts} attempts.`,
  );
};

const collectStartupChecksRPCMetrics = async (
  registry: Registry,
): Promise<void> => {
  const rpcMetrics = new StartupChecksRPCMetrics(registry);
  // secretConfig.rpcUrls_1.length || secretConfig.rpcUrls_17000.length || other ...
  const rpcCount =
    secretConfig[`rpcUrls_${secretConfig.defaultChain}`]?.length ?? 0;
  // retryCount with count shift
  const retryCount = rpcCount * MAX_RETRY_COUNT + 1;

  try {
    // RETRY_WAIT_TIME_MS with time shift 1_000
    const rpcCheckResults = await retryGetRPCChecks(
      retryCount,
      RETRY_WAIT_TIME_MS + 1_000,
    );

    rpcCheckResults.forEach((_check: { domain: string; success: boolean }) => {
      rpcMetrics.requestStatusGauge
        .labels(_check.domain)
        .set(Number(+!_check.success));
    });
  } catch (error) {
    console.error(
      `[collectStartupChecksRPCMetrics] Error collecting RPC metrics: ${error}`,
    );
    rpcMetrics.requestStatusGauge
      .labels('BROKEN_URL') // false as string
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
