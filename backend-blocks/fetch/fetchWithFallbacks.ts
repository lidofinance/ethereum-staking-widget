import invariant from 'tiny-invariant';
import nodeFetch, { RequestInfo, RequestInit, Response } from './fetch';

export interface FetchWithFallbacksOptions extends RequestInit {
  fetch?: (url: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export type FetchWithFallbacks = (
  inputs: RequestInfo[],
  options?: FetchWithFallbacksOptions,
) => Promise<Response>;

export const fetchWithFallbacks: FetchWithFallbacks = async (
  inputs,
  options = {},
) => {
  invariant(inputs.length > 0, 'Inputs are required');

  const { fetch = nodeFetch, ...init } = options;
  const [input, ...restInputs] = inputs;

  try {
    const response = await fetch(input, init);

    invariant(response?.ok, 'Request failed');

    return response;
  } catch (error) {
    if (!restInputs.length) throw error;
    return await fetchWithFallbacks(restInputs, options);
  }
};
