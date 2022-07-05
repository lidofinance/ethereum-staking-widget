import { fetch, RequestInit } from './fetch';
import {
  rpcRequestCount,
  rpcResponseCount,
  rpcResponseTime,
} from '../../utilsApi/metrics';
import invariant from 'tiny-invariant';

export type FetchRPCInitBody = {
  jsonrpc: '2.0'; // Do we support 1.0?
  method: string;
  params?: any;
  id?: string | number | null;
};

export type FetchRPCInit = Omit<RequestInit, 'body'> & {
  body: FetchRPCInitBody;
};

export type ChainID = string | number;
export type ChainRPC = string | string[];

export type FetchRPCFactoryParams = {
  providers: Record<ChainID, ChainRPC>;
  metrics: {
    trackedMethods?: string[];
  };
};

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

export const fetchRPCFactory = ({
  providers,
  metrics: { trackedMethods = ['eth_gasPrice', 'eth_call'] },
}: FetchRPCFactoryParams) => {
  const getRPCMethodLabel = (method: string) =>
    trackedMethods?.includes(method) ? method : 'other';

  return async (chainId: string, init: FetchRPCInit) => {
    const rawUrls = providers[chainId];
    invariant(rawUrls != null, `Chain ${chainId} is not supported`);

    const urls = Array.isArray(rawUrls) ? rawUrls : [rawUrls];
    invariant(urls.length !== 0, 'There are no RPC providers specified');

    for (const url of urls) {
      const provider = getProviderLabel(url);
      const rpcMethodLabel = getRPCMethodLabel(init.body.method);
      const rpcResponseTimer = rpcResponseTime.startTimer();
      rpcRequestCount.labels({ chainId, rpcMethod: rpcMethodLabel }).inc();

      try {
        const fetchInit = {
          ...init,
          body: JSON.stringify(init.body),
        };
        const response = await fetch(url, fetchInit);

        const status = getStatusLabel(response.status);
        rpcResponseCount.labels({ provider, chainId, status }).inc();

        return response;
      } finally {
        rpcResponseTimer({ provider, chainId });
      }
    }
    throw new Error('There is some issue reaching out RPCs');
  };
};
