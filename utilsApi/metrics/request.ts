import { Counter, Histogram, Registry } from 'prom-client';
import { METRICS_PREFIX, METRIC_NAMES } from 'consts/metrics';

export class RequestMetrics {
  apiTimings: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  apiTimingsExternal: Histogram<'hostname' | 'route' | 'entity' | 'status'>;
  requestCounter: Counter<'route'>;
  ethCallToAddress: Counter<
    'address' | 'contractName' | 'methodEncoded' | 'methodDecoded'
  >;
  ssrCounter: Counter<'revalidate'>;
  validationFileLoadError: Counter<'error'>;
  configManifestLoadError: Counter<'source'>;
  portfolioUpstreamCalls: Counter<'scope' | 'result'>;
  portfolioUpstreamRejected: Counter<'scope' | 'reason'>;
  portfolioClientLimited: Counter<'limit'>;
  portfolioStaleServed: Counter<'scope'>;

  constructor(public registry: Registry) {
    this.apiTimings = this.apiTimingsInit('internal');
    this.apiTimingsExternal = this.apiTimingsInit('external');
    this.requestCounter = this.requestsCounterInit();
    this.ethCallToAddress = this.ethCallToAddressInit();
    this.ssrCounter = this.ssrCounterInit();
    this.validationFileLoadError = this.validationFileLoadErrorInit();
    this.configManifestLoadError = this.configManifestLoadErrorInit();
    this.portfolioUpstreamCalls = this.counterInit(
      METRIC_NAMES.PORTFOLIO_UPSTREAM_CALLS,
      'P2P Lambda calls by scope and result (ok | error | quota)',
      ['scope', 'result'],
    );
    this.portfolioUpstreamRejected = this.counterInit(
      METRIC_NAMES.PORTFOLIO_UPSTREAM_REJECTED,
      'P2P Lambda calls not made: budget window, pause or kill switch',
      ['scope', 'reason'],
    );
    this.portfolioClientLimited = this.counterInit(
      METRIC_NAMES.PORTFOLIO_CLIENT_LIMITED,
      'Portfolio requests rejected by a per-client limit',
      ['limit'],
    );
    this.portfolioStaleServed = this.counterInit(
      METRIC_NAMES.PORTFOLIO_STALE_SERVED,
      'Portfolio answers served from an older snapshot',
      ['scope'],
    );
  }

  counterInit<T extends string>(name: string, help: string, labelNames: T[]) {
    return new Counter<T>({
      name: METRICS_PREFIX + name,
      help,
      labelNames,
      registers: [this.registry],
    });
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
      help: 'eth_call invocations.',
      labelNames: ['address', 'contractName', 'methodEncoded', 'methodDecoded'],
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

  configManifestLoadErrorInit() {
    return new Counter({
      name: METRICS_PREFIX + METRIC_NAMES.CONFIG_MANIFEST_LOAD_ERROR,
      help: 'Counts of config manifest load errors by source (file | remote)',
      labelNames: ['source'],
      registers: [this.registry],
    });
  }
}
