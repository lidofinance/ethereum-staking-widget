import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Counter, Registry } from 'prom-client';
import type { TrackedFetchRPC } from '@lidofinance/api-rpc';
import type { FetchRpcInitBody } from '@lidofinance/rpc';
import { iterateUrls } from '@lidofinance/rpc';

export type RpcProviders = Record<string | number, [string, ...string[]]>;

export const DEFAULT_API_ERROR_MESSAGE =
  'Something went wrong. Sorry, try again later :(';

export const HEALTHY_RPC_SERVICES_ARE_OVER = 'Healthy RPC services are over!';

export class UnsupportedChainIdError extends Error {
  constructor(message?: string) {
    super(message || 'Unsupported chainId');
  }
}

export class UnsupportedHTTPMethodError extends Error {
  constructor(message?: string) {
    super(message || 'Unsupported HTTP method');
  }
}

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
  maxBatchCount?: number;
};

export const rpcFactory = ({
  metrics: { prefix, registry },
  providers,
  fetchRPC,
  defaultChain,
  allowedRPCMethods,
  allowedCallAddresses = {},
  maxBatchCount,
}: RPCFactoryParams) => {
  const rpcRequestBlocked = new Counter({
    name: prefix + 'rpc_service_request_blocked',
    help: 'RPC service request blocked',
    labelNames: [],
    registers: [],
  });
  registry.registerMetric(rpcRequestBlocked);

  const allowedCallAddressMap = Object.entries(allowedCallAddresses).reduce(
    (acc, [chainId, addresses]) => {
      acc[chainId] = new Set(addresses.map((a) => a.toLowerCase()));
      return acc;
    },
    {} as Record<string, Set<string>>,
  );

  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      // Accept only POST requests
      if (req.method !== 'POST') {
        // We don't care about tracking blocked requests here
        throw new UnsupportedHTTPMethodError();
      }

      const chainId = Number(req.query.chainId || defaultChain);

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
        throw new Error(`Too many batched requests`);
      }

      // TODO: consider returning array of validators instead of throwing error right away

      // Check if provided methods are allowed
      for (const { method, params } of requests) {
        if (typeof method !== 'string') {
          throw new Error(`RPC method isn't string`);
        }
        if (!allowedRPCMethods.includes(method)) {
          rpcRequestBlocked.inc();
          throw new Error(`RPC method ${method} isn't allowed`);
        }
        if (method === 'eth_call' && allowedCallAddressMap[chainId]) {
          if (
            Array.isArray(params) &&
            typeof params[0] === 'object' &&
            typeof params[0].to === 'string'
          ) {
            if (!allowedCallAddressMap[chainId].has(params[0].to.toLowerCase()))
              throw new Error(`Address not allowed for eth_call`);
          } else throw new Error(`RPC method eth_call is invalid`);
        }
      }

      const requested = await iterateUrls(
        providers[chainId],
        // TODO: consider adding verification that body is actually matches FetchRpcInitBody
        (url) =>
          fetchRPC(url, { body: req.body as FetchRpcInitBody }, { chainId }),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        console.error,
      );

      res.setHeader(
        'Content-Type',
        requested.headers.get('Content-Type') ?? 'application/json',
      );
      if (requested.body) {
        Readable.fromWeb(requested.body as ReadableStream).pipe(res);
      } else {
        res
          .status(requested.status)
          .json('There are a problems with RPC provider');
      }
    } catch (error) {
      if (error instanceof Error) {
        // TODO: check if there are errors duplication with iterateUrls
        console.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
        res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else {
        res.status(500).json(HEALTHY_RPC_SERVICES_ARE_OVER);
      }
    }
  };
};
