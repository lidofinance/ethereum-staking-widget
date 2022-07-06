import {
  fetchRPCFactory,
  FetchRPCFactoryParams,
  UnknownRPCMethodError,
} from './fetchRPCFactory';
import { Registry } from 'prom-client';
import { rpcRequestCountFactory } from './rpcRequestCount';
import { rpcResponseCountFactory } from './rpcResponseCount';
import { rpcBlockedRequestCountFactory } from './rpcBlockedRequestsCount';
import { rpcMethodCountFactory } from './rpcMethodsCount';
import { rpcResponseTimeFactory } from './rpcResponseTime';

/*
 * We need to limit how many statuses reported to prometheus, because of cardinality
 *
 * Examples:
 * getStatusLabel(200) => '2xx'
 * getStatusLabel(404) => '4xx'
 * getStatusLabel(undefined) => 'xxx'
 */
export const getStatusLabel = (status: number | undefined) => {
  if (status == null || status < 100 || status > 600) {
    return 'xxx';
  }
  const majorStatus = Math.trunc(status / 100);
  return `${majorStatus}xx`;
};

/*
 * We also need to limit cardinality of provider labels reported to prometheus, but here
 * we don't need to check if provider is included in the list of available providers,
 * because we get provider from this list itself, but not from user.
 *
 * Examples:
 * getProviderLabel('https://eth-mainnet.alchemyapi.io/v2/...') => 'alchemyapi.io'
 * getProviderLabel('https://goerli.infura.io/v3/...') => 'infura.io'
 */
export const getProviderLabel = (providerURL: string) => {
  const parsedUrl = new URL(providerURL);
  return parsedUrl.hostname.split('.').slice(-2).join('.');
};

export type FetchRPCWithMetricsFactory = FetchRPCFactoryParams & {
  metrics: {
    prefix: string;
    registry: Registry;
  };
};

export const fetchRPCWithMetricsFactory = ({
  metrics: { prefix, registry },
  ...rest
}: FetchRPCWithMetricsFactory) => {
  const rpcRequestCount = rpcRequestCountFactory(prefix);
  registry.registerMetric(rpcRequestCount);

  const rpcResponseTime = rpcResponseTimeFactory(prefix);
  registry.registerMetric(rpcResponseTime);

  const rpcResponseCount = rpcResponseCountFactory(prefix);
  registry.registerMetric(rpcResponseCount);

  const rpcBlockedRequestsCount = rpcBlockedRequestCountFactory(prefix);
  registry.registerMetric(rpcBlockedRequestsCount);

  const rpcMethodCount = rpcMethodCountFactory(prefix);
  registry.registerMetric(rpcMethodCount);

  return fetchRPCFactory({
    ...rest,
    onRequest: async (chainId, url, init) => {
      // Default metrics
      const provider = getProviderLabel(url);
      rpcRequestCount.labels({ chainId, provider }).inc();
      // We can track only whitelisted methods, otherwise prometheus may blow up
      if (rest.allowedRpcMethods != null) {
        const methods = Array.isArray(init?.body)
          ? init.body.map((item) => item?.method)
          : [init?.body?.method];
        methods.forEach((method) => {
          rpcMethodCount.labels(method).inc();
        });
      }

      // Custom metrics
      rest?.onRequest?.(chainId, url, init);
    },
    onResponse: async (chainId, url, response, time) => {
      // Default metrics
      const provider = getProviderLabel(url);
      const status = getStatusLabel(response.status);
      rpcResponseCount.labels({ chainId, provider, status }).inc();
      // rpcResponseTime.observe({ chainId, provider }, time);

      // Custom metrics
      rest?.onResponse?.(chainId, url, response, time);
    },
    onError: async (error) => {
      if (error instanceof UnknownRPCMethodError) {
        rpcBlockedRequestsCount.inc();
      }
    },
  });
};
