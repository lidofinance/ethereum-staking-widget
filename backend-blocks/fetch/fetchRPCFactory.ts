import { fetch, RequestInit, Response } from './fetch';
import { ServerLogger } from '../serverLoggerFactory';
import { startTimer } from '../metrics';

export class UnknownChainIdError extends Error {
  constructor(chainId: ChainID) {
    super(`Chain ${chainId} is not supported`);
  }
}

export class ProviderResponseError extends Error {
  constructor(url: string, status: number) {
    super(`Request to ${url} failed with ${status} code`);
  }
}

export class ExhaustedProvidersError extends Error {
  constructor() {
    super(`There is no responding RPC`);
  }
}

export type RPCError =
  | UnknownChainIdError
  | ProviderResponseError
  | ExhaustedProvidersError
  | Error;

export type FetchRPCInitBody = {
  jsonrpc: '1.0' | '2.0' | string;
  method: string;
  params?: unknown;
  id?: string | number | null;
};

export type FetchRPCInit = Omit<RequestInit, 'body' | 'method'> & {
  method?: 'POST';
  body: FetchRPCInitBody | FetchRPCInitBody[];
};

export type ChainID = string | number;
export type ChainRPC = [string, ...string[]];
export type FetchRPCFactoryParams = {
  providers: Record<ChainID, ChainRPC>;
  logger?: ServerLogger;
  onRequest?: (chainId: ChainID, url: string, init: FetchRPCInit) => unknown;
  onResponse?: (
    chainId: ChainID,
    url: string,
    response: Response,
    elapsedTime: number,
  ) => unknown;
  onError?: (error: RPCError) => unknown;
};

export type FetchRPC = (
  chain: ChainID,
  init: FetchRPCInit,
) => Promise<Response>;

/*
 * In simple examples it converts all functions to asynchronous
 * const syncFn = () => {}
 * const asyncFN = async () => {}
 * toPromise(syncFn) == asyncFN
 * toPromise(asyncFN) == asyncFN
 */
const toPromise =
  <T extends (...args: any[]) => any>(fn: T | undefined) =>
  async (...args: Parameters<T>) =>
    fn == null ? null : await fn(...args);

// TODO: cover with tests
export const fetchRPCFactory = ({
  providers,
  logger,
  onRequest,
  onResponse,
  onError,
}: FetchRPCFactoryParams): FetchRPC => {
  logger?.debug('Creating fetchRPC with providers', providers);

  const handledError = (error: RPCError | unknown) => {
    logger?.error(error);
    if (error instanceof Error) {
      void toPromise(onError)(error);
    }
    return error;
  };

  return async (chainId: ChainID, init: FetchRPCInit) => {
    // Check if there are providers for given chainID
    const urls = providers[chainId];
    if (urls == null) {
      throw handledError(new UnknownChainIdError(chainId));
    }

    // Iterate providers
    for (const url of urls) {
      logger?.debug('Making fetchRPC request to', url);

      try {
        void toPromise(onRequest)(chainId, url, init);
        const timer = startTimer();
        const fetchInit = {
          ...init,
          method: 'POST',
          body: JSON.stringify(init.body),
        };
        const response = await fetch(url, fetchInit);

        const elapsedTime = timer();
        void toPromise(onResponse)(chainId, url, response, elapsedTime);

        if (!response.ok) {
          throw new ProviderResponseError(url, response.status);
        }
        // Return first valid response
        return response;
      } catch (error) {
        // Catch network error
        handledError(error);
      }
    }
    throw handledError(new ExhaustedProvidersError());
  };
};
