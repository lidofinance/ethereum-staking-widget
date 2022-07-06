import { fetch, RequestInit, Response } from './fetch';
import { ServerLogger } from '../serverLoggerFactory';

/*
 * Same as startTime in prom-client Histogram
 * https://github.com/siimon/prom-client/blob/d00dbd55736595887ae77f1431e4326296e3c5ec/lib/summary.js#L141
 */
export const startTimer = () => {
  const start = process.hrtime();
  return () => {
    const delta = process.hrtime(start);
    return delta[0] + delta[1] / 1e9;
  };
};

export class UnknownChainIdError extends Error {}

export class UnknownRPCMethodError extends Error {}

export class EmptyProvidersError extends Error {}

export class FailedRequestError extends Error {}

export type InternalError =
  | UnknownChainIdError
  | UnknownRPCMethodError
  | EmptyProvidersError
  | FailedRequestError;

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
  // List of allowed methods or null if we want to allow all
  allowedRpcMethods: string[] | null;
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

export const fetchRPCFactory = ({
  allowedRpcMethods,
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

      // Check if methods are allowed
      const methods = Array.isArray(init?.body)
        ? init.body.map((item) => item?.method)
        : [init?.body?.method];
      methods.forEach((method) => {
        if (allowedRpcMethods != null && !allowedRpcMethods.includes(method)) {
          throw new UnknownRPCMethodError(
            `Method ${method} isn't part of allowed methods`,
          );
        }
      });

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
            throw new FailedRequestError(
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
