import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { pipeline } from 'node:stream/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Counter, Registry } from 'prom-client';
import type { TrackedFetchRPC } from '@lidofinance/api-rpc';
import type { FetchRpcInitBody } from '@lidofinance/rpc';
import { iterateUrls } from '@lidofinance/rpc';

import {
  DEFAULT_API_ERROR_MESSAGE,
  HEALTHY_RPC_SERVICES_ARE_OVER,
  UnsupportedHTTPMethodError,
  UnsupportedChainIdError,
  InvalidRequestError,
  ClientError,
} from './errors';
import {
  ethCallValidation,
  ethGetLogsValidation,
  rpcMethodsValidation,
  validateMaxSize,
} from './validation';

export type RpcProviders = Record<string | number, [string, ...string[]]>;

export type RPCFactoryParams = {
  metrics: {
    prefix: string;
    registry: Registry;
  };
  providers: RpcProviders;
  fetchRPC: TrackedFetchRPC;
  defaultChain: string | number;
  // If we don't specify allowed RPC methods, then we can't use
  //  fetchRPC with prometheus, otherwise it will blow up, if someone will send arbitrary
  //  methods
  allowedRPCMethods: string[];
  // filtration by eth_call to addresses
  allowedCallAddresses?: Record<number, string[]>;
  allowedLogsAddresses?: Record<number, string[]>;
  disallowEmptyAddressGetLogs?: boolean;
  maxBatchCount?: number;
  maxResponseSize?: number;
};

export const rpcFactory = ({
  metrics: { prefix, registry },
  providers,
  fetchRPC,
  defaultChain,
  allowedRPCMethods,
  allowedCallAddresses,
  maxResponseSize = 1_000_000,
  allowedLogsAddresses,
  maxBatchCount,
}: RPCFactoryParams) => {
  const rpcRequestBlocked = new Counter({
    name: prefix + 'rpc_service_request_blocked',
    help: 'RPC service request blocked',
    labelNames: [],
    registers: [],
  });
  registry.registerMetric(rpcRequestBlocked);

  const validateRpcMethod = rpcMethodsValidation(allowedRPCMethods);

  const validateEthCall =
    allowedCallAddresses && allowedRPCMethods.includes('eth_call')
      ? ethCallValidation(allowedCallAddresses)
      : undefined;

  const validateEthGetLogs =
    allowedLogsAddresses && allowedRPCMethods.includes('eth_getLogs')
      ? ethGetLogsValidation(allowedLogsAddresses)
      : undefined;

  const requestRPC = (chainId: number, body: FetchRpcInitBody) =>
    iterateUrls(
      providers[chainId],
      // TODO: consider adding verification that body is actually matches FetchRpcInitBody
      (url) => fetchRPC(url, { body }, { chainId }),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      console.error,
    );

  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const abortController = new AbortController();
    try {
      // Accept only POST requests
      if (req.method !== 'POST') {
        // We don't care about tracking blocked requests here
        throw new UnsupportedHTTPMethodError();
      }

      const chainId = Number(req.query.chainId || defaultChain);

      const validationContext = {
        chainId,
        rpcRequestBlocked,
        requestRPC,
      };

      // Allow only chainId of specified chains
      if (providers[chainId] == null) {
        // We don't care about tracking blocked requests here
        throw new UnsupportedChainIdError();
      }

      const requests = Array.isArray(req.body) ? req.body : [req.body];

      if (
        typeof maxBatchCount === 'number' &&
        requests.length > maxBatchCount
      ) {
        throw new InvalidRequestError(`Too many batched requests`);
      }

      // We throw HTTP error for ANY invalid RPC request out of batch
      // because we assume that frontend must not send invalid requests at all
      for (const request of requests) {
        validateRpcMethod(request, validationContext);

        const method = request.method;

        if (method === 'eth_call' && validateEthCall) {
          validateEthCall(request, validationContext);
        }
        if (method === 'eth_getLogs' && validateEthGetLogs) {
          await validateEthGetLogs(request, validationContext);
        }
      }

      const requested = await requestRPC(chainId, req.body as FetchRpcInitBody);

      res.setHeader(
        'Content-Type',
        requested.headers.get('Content-Type') ?? 'application/json',
      );
      if (!requested.body) {
        throw new Error('There are a problems with RPC provider');
      }
      await pipeline(
        Readable.fromWeb(requested.body as ReadableStream),
        validateMaxSize(maxResponseSize),
        res,
        { signal: abortController.signal },
      ).finally(() => requested.body?.cancel());
    } catch (error) {
      if (error instanceof ClientError) {
        res.status(400).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else if (error instanceof Error) {
        // TODO: check if there are errors duplication with iterateUrls
        console.error(
          '[rpcFactory]' + error.message ?? DEFAULT_API_ERROR_MESSAGE,
        );
        res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else {
        res.status(500).json(HEALTHY_RPC_SERVICES_ARE_OVER);
      }
    } finally {
      // closes
      abortController.abort();
    }
  };
};
