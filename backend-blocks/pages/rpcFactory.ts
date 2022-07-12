import type { NextApiRequest, NextApiResponse } from 'next';
import { Counter, Registry } from 'prom-client';
import { TrackedFetchRPC } from '../fetch';
import { ServerLogger } from '../utils';
import { ChainID } from '../types';
import { iterateUrls } from '../utils';
import { Providers } from '../types';

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
  providers: Providers;
  fetchRPC: TrackedFetchRPC;
  serverLogger: ServerLogger;
  defaultChain: ChainID;
  // If we don't specify allowed RPC methods, then we can't use
  //  fetchRPC with prometheus, otherwise it will blow up, if someone will send arbitrary
  //  methods
  allowedRPCMethods: string[];
};

export const rpcFactory = ({
  metrics: { prefix, registry },
  providers,
  fetchRPC,
  serverLogger,
  defaultChain,
  allowedRPCMethods,
}: RPCFactoryParams) => {
  const rpcRequestBlocked = new Counter({
    name: prefix + 'rpc_service_request_blocked',
    help: 'RPC service request blocked',
    labelNames: [],
    registers: [],
  });
  registry.registerMetric(rpcRequestBlocked);

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

      // Check if provided methods are allowed
      for (const { method } of Array.isArray(req.body)
        ? req.body
        : [req.body]) {
        if (!allowedRPCMethods.includes(method)) {
          rpcRequestBlocked.inc();
          throw new Error(`RPC method ${method} isn't allowed`);
        }
      }

      const requested = await iterateUrls(
        providers[chainId],
        (url) => fetchRPC({ url, init: { body: req.body }, chainId }),
        serverLogger.error,
      );

      res.setHeader(
        'Content-Type',
        requested.headers.get('Content-Type') ?? 'application/json',
      );
      res.status(requested.status).send(requested.body);
    } catch (error) {
      if (error instanceof Error) {
        serverLogger.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
        res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else {
        res.status(500).json(HEALTHY_RPC_SERVICES_ARE_OVER);
      }
    }
  };
};
