import { Readable, Transform } from 'node:stream';
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

export class ClientError extends Error {}
export class UnsupportedChainIdError extends ClientError {
  constructor(message?: string) {
    super(message || 'Unsupported chainId');
  }
}

export class UnsupportedHTTPMethodError extends ClientError {
  constructor(message?: string) {
    super(message || 'Unsupported HTTP method');
  }
}

export class InvalidRequestError extends ClientError {
  constructor(message?: string) {
    super(message || 'Invalid Request');
  }
}

export class SizeTooLargeError extends ClientError {
  constructor(message?: string) {
    super(message || 'Invalid Request');
  }
}

const createSizeLogger = (MAX_SIZE: number) => {
  let bytesWritten = 0;
  const logSizeStream = new Transform({
    transform(chunk, _encoding, callback) {
      bytesWritten += chunk.length;
      if (bytesWritten > MAX_SIZE) {
        // Emit an error if size exceeds MAX_SIZE
        return callback(
          new SizeTooLargeError(
            `Stream size exceeds the maximum limit of ${MAX_SIZE} bytes`,
          ),
        );
      }
      return callback(null, chunk); // Pass the chunk through
    },
    flush(callback) {
      callback();
    },
  });
  return logSizeStream;
};

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
  allowedCallAddresses = {},
  allowedLogsAddresses = {},
  maxBatchCount,
  maxResponseSize = 1_000_000, // ~1MB,
  disallowEmptyAddressGetLogs = false,
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

  const allowedLogsAddressMap = Object.entries(allowedLogsAddresses).reduce(
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
        throw new InvalidRequestError(`Too many batched requests`);
      }

      // Check if provided methods are allowed
      // We throw HTTP error for ANY invalid RPC request out of batch
      // because we assume that frontend must not send invalid requests
      for (const { method, params } of requests) {
        if (typeof method !== 'string') {
          throw new InvalidRequestError(`RPC method isn't string`);
        }
        if (!allowedRPCMethods.includes(method)) {
          rpcRequestBlocked.inc();
          throw new InvalidRequestError(`RPC method ${method} isn't allowed`);
        }
        if (method === 'eth_call' && allowedCallAddressMap[chainId]) {
          if (
            Array.isArray(params) &&
            typeof params[0] === 'object' &&
            typeof params[0].to === 'string'
          ) {
            if (
              !allowedCallAddressMap[chainId].has(params[0].to.toLowerCase())
            ) {
              rpcRequestBlocked.inc();
              throw new InvalidRequestError(`Address not allowed for eth_call`);
            }
          } else
            throw new InvalidRequestError(`RPC method eth_call is invalid`);
        }
        if (
          method === 'eth_getLogs' &&
          (disallowEmptyAddressGetLogs || allowedLogsAddressMap[chainId])
        ) {
          if (Array.isArray(params) && typeof params[0] === 'object') {
            const address = params[0].address;
            if (
              disallowEmptyAddressGetLogs &&
              (!address || (Array.isArray(address) && address.length === 0))
            ) {
              rpcRequestBlocked.inc();
              throw new InvalidRequestError(`No empty address on eth_getLogs`);
            }
            const addresses = Array.isArray(address) ? address : [address];
            if (
              addresses.some(
                (eventAddress) =>
                  // needs this check before toLowerCase
                  typeof eventAddress !== 'string' ||
                  !allowedLogsAddressMap[chainId].has(
                    eventAddress.toLowerCase(),
                  ),
              )
            ) {
              rpcRequestBlocked.inc();
              throw new InvalidRequestError(
                `Address not allowed for eth_getLogs`,
              );
            }
          } else throw new InvalidRequestError(`Invalid eth_getLogs`);
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
        const sizeLimit = createSizeLogger(maxResponseSize);
        const readableStream = Readable.fromWeb(
          requested.body as ReadableStream,
        );
        readableStream
          .pipe(sizeLimit)
          .on('error', (error) => {
            if (error instanceof SizeTooLargeError) {
              console.warn('[rpcFactory] RPC response too large', {
                request: JSON.stringify(requests),
              });
              res.statusCode = 413; // Payload Too Large
              res.end(error.message);
            } else {
              res.statusCode = 500;
              res.end(DEFAULT_API_ERROR_MESSAGE);
            }
            readableStream.destroy();
          })
          .pipe(res);
      } else {
        res
          .status(requested.status)
          .json('There are a problems with RPC provider');
      }
    } catch (error) {
      if (error instanceof Error) {
        // TODO: check if there are errors duplication with iterateUrls
        console.error(
          '[rpcFactory]' + error.message ?? DEFAULT_API_ERROR_MESSAGE,
        );
        res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else {
        res.status(500).json(HEALTHY_RPC_SERVICES_ARE_OVER);
      }
    }
  };
};
