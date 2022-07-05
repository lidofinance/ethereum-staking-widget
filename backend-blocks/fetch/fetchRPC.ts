import invariant from 'tiny-invariant';
import { CHAINS } from '@lido-sdk/constants';
import { fetchWithFallbacks } from './fetchWithFallbacks';
import { getRPCUrls, RPCProvidersKeys } from './providersUrls';
import { RequestInit, Response } from './fetch';

export type FetRPCUrl = (chainId: CHAINS) => string;

export interface FetchRPCOptions extends RequestInit {
  providers?: RPCProvidersKeys;
  urls?: (string | FetRPCUrl)[];
}

export type FetchRPC = (
  chainId: CHAINS,
  options: FetchRPCOptions,
) => Promise<Response>;

export const fetchRPC: FetchRPC = (chainId, options) => {
  const { providers = {}, urls = [], ...init } = options;

  const customUrls = urls.map((value) => {
    let url = value;
    if (typeof value === 'function') url = value(chainId);
    invariant(typeof url === 'string', 'URL should be a string');

    return url;
  });
  const providersUrls = getRPCUrls(chainId, providers);
  const combinedUrls = [...customUrls, ...providersUrls];

  invariant(combinedUrls.length > 0, 'There are no API keys or URLs provided');

  return fetchWithFallbacks(combinedUrls, { method: 'POST', ...init });
};
