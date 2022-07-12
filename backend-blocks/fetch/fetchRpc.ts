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

export type DefaultExtension = Record<string | number, unknown>;

export type FetchRpcParameters<
  Extension extends DefaultExtension = DefaultExtension,
> = {
  url: string;
  init: FetchRpcInit;
} & Extension;

export type FetchRpc<Extension extends DefaultExtension = DefaultExtension> = (
  options: FetchRpcParameters<Extension>,
) => Promise<Response>;

export const fetchRpc: FetchRpc = async ({ url, init }) => {
  const fetchInit = {
    ...init,
    method: 'POST',
    body: JSON.stringify(init.body),
  };
  return await fetch(url, fetchInit);
};
