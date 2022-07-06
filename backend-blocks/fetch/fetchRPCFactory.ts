import { fetch, RequestInit, Response } from './fetch';
import invariant from 'tiny-invariant';
import { ServerLogger } from '../serverLoggerFactory';
import { Registry } from 'prom-client';

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

/*
 * Same as in prom-client
 * https://github.com/siimon/prom-client/blob/d00dbd55736595887ae77f1431e4326296e3c5ec/lib/summary.js#L141
 */
export const startTimer = () => {
  const start = process.hrtime();
  return () => {
    const delta = process.hrtime(start);
    return delta[0] + delta[1] / 1e9;
  };
};

export type FetchRPCInitBody = {
  jsonrpc: '2.0'; // Do we support 1.0?
  method: string;
  params?: unknown;
  id?: string | number | null;
};

export type FetchRPCInit = Omit<RequestInit, 'body' | 'method'> & {
  method?: 'POST';
  body: FetchRPCInitBody;
};

export type ChainID = string | number;
export type ChainRPC = string | string[];
export type FetchRPCFactoryParams = {
  // TODO: Use registry
  registry: Registry;
  providers: Record<ChainID, ChainRPC>;
  logger?: ServerLogger;
  onBeforeRequest?: (
    chainId: ChainID,
    url: string,
    init: FetchRPCInit,
  ) => unknown;
  onAfterRequest?: (
    chainId: ChainID,
    url: string,
    response: Response,
    timer: number,
  ) => unknown;
};

// TODO: consider what do we do with the fetchRPC in liso-js-sdk
// TODO: add cache for in-flight requests
export const fetchRPCFactory = ({
  providers,
  logger,
  onBeforeRequest,
  onAfterRequest,
}: FetchRPCFactoryParams) => {
  logger?.debug('Creating fetchRPC with providers:', providers);
  return async (chainId: ChainID, init: FetchRPCInit) => {
    const rawUrls = providers[chainId];
    invariant(rawUrls != null, `Chain ${chainId} is not supported`);

    const urls = Array.isArray(rawUrls) ? rawUrls : [rawUrls];
    invariant(urls.length !== 0, 'There are no RPC providers specified');

    for (const url of urls) {
      logger?.debug('fetchRPC request to', url);
      onBeforeRequest?.(chainId, url, init);
      const timer = startTimer();

      try {
        const fetchInit = {
          ...init,
          method: 'POST',
          body: JSON.stringify(init.body),
        };
        const response = await fetch(url, fetchInit);

        const time = timer();
        onAfterRequest?.(chainId, url, response, time);

        invariant(
          response.ok,
          `Request to ${url} failed with ${response.status} code`,
        );
        return response;
      } catch (error) {
        logger?.error(error);
      }
    }
    throw new Error('There is some issue reaching out RPCs');
  };
};
