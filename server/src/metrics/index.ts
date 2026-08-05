import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';
import { collectStartupMetrics as collectBuildInfoMetrics } from '@lidofinance/api-metrics';

import buildInfoJson from 'build-info.json';
import { openKeys } from '../../../scripts/log-environment-variables.mjs';
import {
  getRPCChecks,
  startupCheckRPCs,
} from '../../../scripts/startup-checks/rpc.mjs';

import { config, supportedChainIds } from '../config.js';
import { maskedError } from '../utils/masked-error.js';

/**
 * Prometheus metrics — port of `utilsApi/metrics/*`.
 *
 * METRIC NAMES ARE LOAD-BEARING: dashboards and alerts are keyed on the
 * `eth_stake_widget_ui_` prefix and the exact metric/label names from the
 * Next.js app. Do not rename (the previous PoC port drifted to a
 * `staking_widget_` prefix and lost the ABI-decoded eth_call labels).
 *
 * Dropped vs legacy: `ssr_count` — there is no SSR/ISR in the SPA build,
 * the counter could never increment.
 */
export const METRICS_PREFIX = 'eth_stake_widget_ui_';

const enum METRIC_NAMES {
  REQUESTS_TOTAL = 'requests_total',
  STARTUP_CHECKS_RPC_FAILED = 'startup_checks_rpc_failed',
  API_RESPONSE = 'api_response',
  ETH_CALL_ADDRESS_TO = 'eth_call_address_to',
  VALIDATION_FILE_LOAD_ERROR = 'validation_file_load_error',
  CONFIG_MANIFEST_LOAD_ERROR = 'config_manifest_load_error',
}

export class RequestMetrics {
  apiTimings: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  apiTimingsExternal: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  requestCounter: Counter<'route' | 'entity'>;
  ethCallToAddress: Counter<
    'address' | 'contractName' | 'methodEncoded' | 'methodDecoded'
  >;
  validationFileLoadError: Counter<'error'>;
  configManifestLoadError: Counter<'source'>;

  constructor(public registry: Registry) {
    this.apiTimings = this.apiTimingsInit('internal');
    this.apiTimingsExternal = this.apiTimingsInit('external');

    this.requestCounter = new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.REQUESTS_TOTAL,
      help: 'Total number of requests for each valid route',
      labelNames: ['route', 'entity'],
      registers: [registry],
    });

    this.ethCallToAddress = new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.ETH_CALL_ADDRESS_TO,
      help: 'eth_call invocations.',
      labelNames: ['address', 'contractName', 'methodEncoded', 'methodDecoded'],
      registers: [registry],
    });

    this.validationFileLoadError = new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.VALIDATION_FILE_LOAD_ERROR,
      help: 'Counts of validation file load errors',
      labelNames: ['error'],
      registers: [registry],
    });

    this.configManifestLoadError = new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.CONFIG_MANIFEST_LOAD_ERROR,
      help: 'Counts of config manifest load errors by source (file | remote)',
      labelNames: ['source'],
      registers: [registry],
    });
  }

  private apiTimingsInit(postfix: string) {
    return new Histogram({
      name: `${METRICS_PREFIX}${METRIC_NAMES.API_RESPONSE}_${postfix}`,
      help: 'API response time',
      labelNames: ['hostname', 'route', 'entity', 'status'],
      buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
      registers: [this.registry],
    });
  }
}

class StartupChecksRPCMetrics {
  requestStatusGauge: Gauge<'rpc_domain' | 'chain_id'>;

  constructor(registry: Registry) {
    this.requestStatusGauge = new Gauge({
      name: METRICS_PREFIX + METRIC_NAMES.STARTUP_CHECKS_RPC_FAILED,
      help: 'The total number of RPC checks after the app started.',
      labelNames: ['rpc_domain', 'chain_id'],
      registers: [registry],
    });
  }
}

const collectStartupChecksRPCMetrics = async (
  registry: Registry,
): Promise<void> => {
  // checks disabled (local dev): no gauge and no error noise — getRPCChecks
  // can only resolve null here, which used to log a boot Error every start
  if (process.env.RUN_STARTUP_CHECKS !== 'true') return;

  const rpcMetrics = new StartupChecksRPCMetrics(registry);

  try {
    await startupCheckRPCs();
    const rpcChecksResults = await getRPCChecks();
    if (!rpcChecksResults) {
      throw new Error(
        '[collectStartupChecksRPCMetrics] getRPCChecks resolved as "null"!',
      );
    }

    rpcChecksResults.forEach(
      (check: { domain: string; chainId: number; success: boolean }) => {
        rpcMetrics.requestStatusGauge
          .labels({ rpc_domain: check.domain, chain_id: check.chainId })
          .set(Number(+!check.success));
      },
    );
  } catch (error) {
    console.error(
      '[collectStartupChecksRPCMetrics] Error collecting RPC metrics:',
      maskedError(error),
    );
    rpcMetrics.requestStatusGauge.labels({ rpc_domain: 'BROKEN_URL' }).inc(1);
  }
};

const collectEnvInfoMetrics = (registry: Registry): void => {
  const labelPairs = openKeys.map((key: string) => ({
    name: key,
    value: process.env[key] ?? '',
  }));

  const envInfo = new Gauge({
    name: METRICS_PREFIX + 'env_info',
    help: 'Environment variables of the current runtime',
    labelNames: labelPairs.map((pair: { name: string }) => pair.name),
    registers: [registry],
  });
  envInfo
    .labels(...labelPairs.map((pair: { value: string }) => pair.value))
    .set(1);
};

const collectStartupMetrics = async (registry: Registry): Promise<void> => {
  if (!config.COLLECT_METRICS) return;

  collectEnvInfoMetrics(registry);

  collectBuildInfoMetrics({
    prefix: METRICS_PREFIX,
    registry,
    defaultChain: `${config.DEFAULT_CHAIN}`,
    supportedChains: supportedChainIds.map((chain) => `${chain}`),
    version: buildInfoJson.version,
    commit: buildInfoJson.commit,
    branch: buildInfoJson.branch,
  });

  await collectStartupChecksRPCMetrics(registry);
};

class Metrics {
  registry = new Registry();
  request = new RequestMetrics(this.registry);

  constructor() {
    void collectStartupMetrics(this.registry);
    collectDefaultMetrics({
      prefix: METRICS_PREFIX,
      register: this.registry,
    });
  }
}

// Single instance per process (no HMR concerns here, but keeps the shape
// identical to the legacy module and guards against double-registration
// under tsx watch restarts).
const g = globalThis as { __metricsSingleton?: Metrics };
const metrics: Metrics = g.__metricsSingleton ?? new Metrics();
if (!g.__metricsSingleton) g.__metricsSingleton = metrics;

export default metrics;
