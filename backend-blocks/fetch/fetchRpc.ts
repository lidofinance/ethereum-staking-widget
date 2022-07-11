import fetch, { RequestInit, Response } from 'node-fetch';
import { ChainID } from '../types';

export type FetchRpcInitBody = {
  jsonrpc: '1.0' | '2.0' | string;
  method: string;
  params?: unknown;
  id?: string | number | null;
};

export type FetchRpcInit = Omit<RequestInit, 'body' | 'method'> & {
  method?: 'POST';
  body: FetchRpcInitBody | FetchRpcInitBody[];
};

export type FetchRpc = (
  /*
   * Need chainId for trackedFetchRpc, but haven't found a nice way to hide this argument, so we
   * don't break function signature in rpc endpoint and other places
   */
  chainId: ChainID,
  url: string,
  init: FetchRpcInit,
) => Promise<Response>;

export const fetchRpc: FetchRpc = async (chainId, url, init) => {
  const fetchInit = {
    ...init,
    method: 'POST',
    body: JSON.stringify(init.body),
  };
  return await fetch(url, fetchInit);
};
