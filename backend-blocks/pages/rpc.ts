import type { NextApiRequest, NextApiResponse } from 'next';
import { Counter, Registry } from 'prom-client';
import { ChainID, FetchRPC } from '../fetch';
import { ServerLogger } from '../serverLoggerFactory';

export const DEFAULT_API_ERROR_MESSAGE =
  'Something went wrong. Sorry, try again later :(';

export const HEALTHY_RPC_SERVICES_ARE_OVER = 'Healthy RPC services are over!';

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
  fetchRPC: FetchRPC;
  serverLogger: ServerLogger;
  defaultChain: ChainID;
  allowedRPCMethods: string[] | null;
};

export const rpcFactory = ({
  metrics: { prefix, registry },
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
      if (req.method !== 'POST') {
        throw new UnsupportedHTTPMethodError();
      }

      const chainId = Number(req.query.chainId || defaultChain);

      (Array.isArray(req.body)
        ? req.body.map((item) => item?.method)
        : [req?.body?.method]
      ).forEach((method) => {
        if (allowedRPCMethods != null && !allowedRPCMethods.includes(method)) {
          rpcRequestBlocked.inc();
          throw new Error(`RPC method ${method} isn't allowed`);
        }
      });

      const requested = await fetchRPC(chainId, { body: req.body });

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
