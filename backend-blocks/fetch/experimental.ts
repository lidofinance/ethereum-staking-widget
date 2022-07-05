import { fetch, RequestInit } from './fetch';
import invariant from 'tiny-invariant';
import { serverLogger } from '../../utilsApi';
import { RpcResponseCount, RpcResponseTime } from '../commonMetrics';

/*
 * We need to limit how many statuses reported to prometheus, because of cardinality
 *
 * Examples:
 * getStatusLabel(200) => '2xx'
 * getStatusLabel(404) => '4xx'
 * getStatusLabel(undefined) => 'xxx'
 */
const getStatusLabel = (status: number | undefined) => {
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
const getProviderLabel = (providerURL: string) => {
  const parsedUrl = new URL(providerURL);
  return parsedUrl.hostname.split('.').slice(-2).join('.');
};

export type FetchRPCInitBody = {
  jsonrpc: '2.0'; // Do we support 1.0?
  method: string;
  params?: any;
  id?: string | number | null;
};

export type FetchRPCInit = Omit<RequestInit, 'body' | 'method'> & {
  method?: 'POST';
  body: FetchRPCInitBody;
};

export type ChainID = string | number;
export type ChainRPC = string | string[];
export type FetchRPCFactoryParams = {
  providers: Record<ChainID, ChainRPC>;
  metrics?: {
    rpcRequestCount?: RpcResponseCount;
    rpcResponseCount?: RpcResponseCount;
    rpcResponseTime?: RpcResponseTime;
  };
};

export const fetchRPCFactory = ({
  providers,
  metrics,
}: FetchRPCFactoryParams) => {
  return async (chainId: ChainID, init: FetchRPCInit) => {
    const rawUrls = providers[chainId];
    invariant(rawUrls != null, `Chain ${chainId} is not supported`);

    const urls = Array.isArray(rawUrls) ? rawUrls : [rawUrls];
    invariant(urls.length !== 0, 'There are no RPC providers specified');

    for (const url of urls) {
      const provider = getProviderLabel(url);
      metrics?.rpcRequestCount?.labels?.({ chainId, provider }).inc();
      const rpcResponseTimer = metrics?.rpcResponseTime?.startTimer?.();

      try {
        const fetchInit = {
          ...init,
          method: 'POST',
          body: JSON.stringify(init.body),
        };
        const response = await fetch(url, fetchInit);

        const status = getStatusLabel(response.status);
        metrics?.rpcResponseCount
          ?.labels?.({ chainId, provider, status })
          ?.inc();

        invariant(response.ok, `Request to ${url} failed with ${status} code`);
        return response;
      } catch (error) {
        serverLogger.error(error);
      } finally {
        rpcResponseTimer?.({ chainId, provider });
      }
    }
    throw new Error('There is some issue reaching out RPCs');
  };
};
