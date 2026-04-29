import {
  collectDefaultMetrics,
  Registry,
  Counter,
  Histogram,
} from 'prom-client';

// Inlined from consts/metrics.ts
export const METRICS_PREFIX = 'eth_stake_widget_ui_';

const METRIC_NAMES = {
  REQUESTS_TOTAL: 'requests_total',
  STARTUP_CHECKS_RPC_FAILED: 'startup_checks_rpc_failed',
  API_RESPONSE: 'api_response',
  ETH_CALL_ADDRESS_TO: 'eth_call_address_to',
  SSR_COUNT: 'ssr_count',
  VALIDATION_FILE_LOAD_ERROR: 'validation_file_load_error',
} as const;

class RequestMetrics {
  apiTimings: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  apiTimingsExternal: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  requestCounter: Counter<'route'>;
  ethCallToAddress: Counter<'address' | 'referrer'>;
  ssrCounter: Counter<'revalidate'>;
  validationFileLoadError: Counter<'error'>;

  constructor(public registry: Registry) {
    this.apiTimings = this.apiTimingsInit('internal');
    this.apiTimingsExternal = this.apiTimingsInit('external');
    this.requestCounter = this.requestsCounterInit();
    this.ethCallToAddress = this.ethCallToAddressInit();
    this.ssrCounter = this.ssrCounterInit();
    this.validationFileLoadError = this.validationFileLoadErrorInit();
  }

  apiTimingsInit(postfix: string) {
    const postfixWithDash = postfix ? `_${postfix}` : '';
    const apiResponseName =
      METRICS_PREFIX + METRIC_NAMES.API_RESPONSE + postfixWithDash;

    return new Histogram({
      name: apiResponseName,
      help: 'API response time',
      labelNames: ['hostname', 'route', 'entity', 'status'],
      buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
      registers: [this.registry],
    });
  }

  requestsCounterInit() {
    const requestsCounterName = METRICS_PREFIX + METRIC_NAMES.REQUESTS_TOTAL;

    return new Counter({
      name: requestsCounterName,
      help: 'Total number of requests for each valid route',
      labelNames: ['route', 'entity'],
      registers: [this.registry],
    });
  }

  ethCallToAddressInit() {
    return new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.ETH_CALL_ADDRESS_TO,
      help: 'Addresses presented as "to" in eth_call requests',
      labelNames: [
        'address',
        'referer',
        'contractName',
        'methodEncoded',
        'methodDecoded',
      ],
      registers: [this.registry],
    });
  }

  ssrCounterInit() {
    return new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.SSR_COUNT,
      help: 'Counts of running getDefaultStaticProps with revalidation param',
      labelNames: ['revalidate'],
      registers: [this.registry],
    });
  }

  validationFileLoadErrorInit() {
    return new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.VALIDATION_FILE_LOAD_ERROR,
      help: 'Counts of validation file load errors',
      labelNames: ['error'],
      registers: [this.registry],
    });
  }
}

const registry = new Registry();
collectDefaultMetrics({ prefix: METRICS_PREFIX, register: registry });

const Metrics = {
  registry,
  request: new RequestMetrics(registry),
};

export default Metrics;
