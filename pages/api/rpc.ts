import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import {
  DEFAULT_API_ERROR_MESSAGE,
  HEALTHY_RPC_SERVICES_ARE_OVER,
  METRICS_PREFIX,
} from 'config';
import { serverLogger } from 'utilsApi';
import { fetchRPC } from 'utilsApi/fetchRPC';
import { Counter } from 'prom-client';
import { registry } from 'utilsApi/metrics';

const { publicRuntimeConfig } = getConfig();
const { defaultChain } = publicRuntimeConfig;

type Rpc = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const rpcRequestBlocked = new Counter({
  name: METRICS_PREFIX + 'rpc_service_request_blocked',
  help: 'RPC service request blocked',
  labelNames: [],
  registers: [],
});
registry.registerMetric(rpcRequestBlocked);

const allowedRpcMethods: string[] = [];

// TODO: move rpc endpoint to backend-blocks
// TODO: forbid GET, HEAD, ... request types
// Proxy for third-party API.
const rpc: Rpc = async (req, res) => {
  try {
    const chainId = Number(req.query.chainId || defaultChain);

    const methods = Array.isArray(req.body)
      ? req.body.map((item) => item?.method)
      : [req?.body?.method];
    methods.forEach((method) => {
      if (!allowedRpcMethods.includes(method)) {
        // TODO: check for content-type of error (xss)
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

export default rpc;
