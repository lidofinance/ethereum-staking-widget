import { COW_API_BASE } from '../consts';
import type {
  CowQuoteRequest,
  CowQuoteResponse,
  CowOrderRequest,
  CowOrderResponse,
  CowApiError as CowApiErrorBody,
} from './types';

class CowApiError extends Error {
  constructor(
    public status: number,
    public errorType: string,
    message: string,
  ) {
    super(message);
    this.name = 'CowApiError';
  }
}

const cowFetch = async <T>(
  chainId: number,
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const base = COW_API_BASE[chainId];
  if (!base) {
    throw new Error(`CoW Protocol API not available for chain ${chainId}`);
  }

  const res = await fetch(`${base}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error: CowApiErrorBody | Record<string, never> = await res
      .json()
      .catch(() => ({}));
    throw new CowApiError(
      res.status,
      'description' in error ? error.errorType : 'unknown',
      'description' in error
        ? error.description
        : `CoW API error: ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
};

export const cowApi = {
  getQuote: (chainId: number, request: CowQuoteRequest) =>
    cowFetch<CowQuoteResponse>(chainId, '/quote', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  submitOrder: (chainId: number, order: CowOrderRequest) =>
    cowFetch<string>(chainId, '/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),

  getOrder: (chainId: number, orderUid: string) =>
    cowFetch<CowOrderResponse>(chainId, `/orders/${orderUid}`),
};
