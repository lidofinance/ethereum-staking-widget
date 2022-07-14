import fetch, { RequestInit, Response } from 'node-fetch';

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

// Need Extension type so we can extend fetchRPC with metrics tracking or caching
export type FetchRpc<
  Extension extends Record<string | number, unknown> | void = void,
> = (
  url: string,
  init: FetchRpcInit,
  extension: Extension,
) => Promise<Response>;

export const fetchRpc: FetchRpc = async (url, init) => {
  const fetchInit = {
    ...init,
    method: 'POST',
    body: JSON.stringify(init.body),
  };
  return await fetch(url, fetchInit);
};
