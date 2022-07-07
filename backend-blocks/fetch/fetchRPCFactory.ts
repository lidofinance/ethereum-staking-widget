import { fetch, RequestInit, Response } from './fetch';
import { ServerLogger } from '../serverLoggerFactory';
import { startTimer } from '../metrics';

export class UnknownChainIdError extends Error {}

export class EmptyProvidersError extends Error {}

export class NetworkError extends Error {}

export type InternalError =
  | UnknownChainIdError
  | EmptyProvidersError
  | NetworkError;

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
export type ChainRPC = string | string[];
export type FetchRPCFactoryParams = {
  providers: Record<ChainID, ChainRPC>;
  logger?: ServerLogger;
  onRequest?: (
    chainId: ChainID,
    url: string,
    init: FetchRPCInit,
  ) => Promise<unknown>;
  onResponse?: (
    chainId: ChainID,
    url: string,
    response: Response,
    elapsedTime: number,
  ) => Promise<unknown>;
  onError?: (error: InternalError | Error) => Promise<unknown>;
};

// TODO: cover with tests
export const fetchRPCFactory = ({
  providers,
  logger,
  onRequest,
  onResponse,
  onError,
}: FetchRPCFactoryParams) => {
  logger?.debug('Creating fetchRPC with providers', providers);

  return async (chainId: ChainID, init: FetchRPCInit) => {
    try {
      // Check if there are providers
      const rawUrls = providers[chainId];
      if (rawUrls == null) {
        throw new UnknownChainIdError(`Chain ${chainId} is not supported`);
      }

      // Double check if providers urls are valid
      const urls = Array.isArray(rawUrls) ? rawUrls : [rawUrls];
      if (urls.length === 0) {
        throw new EmptyProvidersError('There are no RPC providers specified');
      }

      // Iterate providers
      for (const url of urls) {
        logger?.debug('Making fetchRPC request to', url);

        try {
          void onRequest?.(chainId, url, init);
          const timer = startTimer();
          const fetchInit = {
            ...init,
            method: 'POST',
            body: JSON.stringify(init.body),
          };
          const response = await fetch(url, fetchInit);

          const elapsedTime = timer();
          void onResponse?.(chainId, url, response, elapsedTime);

          if (!response.ok) {
            throw new NetworkError(
              `Request to ${url} failed with ${response.status} code`,
            );
          }
          // Return first valid response
          return response;
          // Catch network error
        } catch (error) {
          logger?.error(error);
          if (error instanceof Error) {
            void onError?.(error);
          }
        }
      }
      throw new Error('There is some issue reaching out RPCs');
      // Catch validation errors
    } catch (error) {
      logger?.error(error);
      if (error instanceof Error) {
        onError?.(error);
      }
      throw error;
    }
  };
};
