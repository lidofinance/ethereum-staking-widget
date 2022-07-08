import fetch, { RequestInit, Response } from 'node-fetch';
import { ServerLogger } from '../serverLoggerFactory';
import { startTimer, toPromise } from '../metrics';

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
export type FetchRPCFactoryParameters = {
  providers: Record<ChainID, ChainRPC>;
  serverLogger?: ServerLogger;
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

// TODO: cover with tests
export const fetchRPCFactory = ({
  providers,
  serverLogger,
  onRequest,
  onResponse,
  onError,
}: FetchRPCFactoryParameters): FetchRPC => {
  serverLogger?.debug('Creating fetchRPC with providers', providers);

  const loggedError = (error: RPCError | unknown) => {
    serverLogger?.error(error);
    if (error instanceof Error) {
      void toPromise(onError)(error);
    }
    return error;
  };

  return async (chainId: ChainID, init: FetchRPCInit) => {
    const urls = providers[chainId];

    // Check if there are providers for given chainID
    if (urls == null) {
      throw loggedError(new UnknownChainIdError(chainId));
    }

    // Iterate providers
    for (const url of urls) {
      serverLogger?.debug('Making fetchRPC request to', url);

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
          throw loggedError(new ProviderResponseError(url, response.status));
        }
        // Return first valid response
        return response;
      } catch (error) {
        // Catch network error, we need to not rethrow it, so we iterate loop further
        loggedError(error);
      }
    }
    throw loggedError(new ExhaustedProvidersError());
  };
};
