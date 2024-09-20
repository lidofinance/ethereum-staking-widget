import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Counter, Registry } from 'prom-client';
import type { TrackedFetchRPC } from '@lidofinance/api-rpc';
import type { FetchRpcInitBody } from '@lidofinance/rpc';
import { iterateUrls } from '@lidofinance/rpc';

type EthCallParams = [{ to: string; [key: string]: any }];
type EthGetLogsParams = [{ address?: string | string[]; [key: string]: any }];

type ValidatingMethodsType = 'eth_call' | 'eth_getLogs';
type MethodParams = {
  eth_call: EthCallParams;
  eth_getLogs: EthGetLogsParams;
};

export type RpcProviders = Record<string | number, [string, ...string[]]>;

export const DEFAULT_API_ERROR_MESSAGE =
  'Something went wrong. Sorry, try again later :(';
export const HEALTHY_RPC_SERVICES_ARE_OVER = 'Healthy RPC services are over!';
export const HTTP_METHOD_POST = 'POST';
export const CONTENT_TYPE_JSON = 'application/json';

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

type ValidatorContext = {
  allowedCallAddressMap: Record<string, Set<string>>;
  allowedLogsAddressMap: Record<string, Set<string>>;
  chainId: number;
  rpcRequestBlocked: Counter<string>;
  disallowEmptyAddressGetLogs: boolean;
};

const validateEthCall = (params: EthCallParams, context: ValidatorContext) => {
  const { allowedCallAddressMap, chainId, rpcRequestBlocked } = context;
  if (!allowedCallAddressMap[chainId]) return;

  const [{ to }] = params;
  if (typeof to !== 'string') {
    throw new InvalidRequestError(`Invalid eth_call params`);
  }
  if (!allowedCallAddressMap[chainId].has(to.toLowerCase())) {
    rpcRequestBlocked.inc();
    throw new InvalidRequestError(`Address not allowed for eth_call`);
  }
};

const validateEthGetLogs = (
  params: EthGetLogsParams,
  context: ValidatorContext,
) => {
  const {
    disallowEmptyAddressGetLogs,
    chainId,
    rpcRequestBlocked,
    allowedLogsAddressMap,
  } = context;
  if (!disallowEmptyAddressGetLogs && !allowedLogsAddressMap[chainId]) return;

  const [{ address }] = params;
  if (
    disallowEmptyAddressGetLogs &&
    (!address || (Array.isArray(address) && address.length === 0))
  ) {
    rpcRequestBlocked.inc();
    throw new InvalidRequestError(`No empty address on eth_getLogs`);
  }

  const addresses = Array.isArray(address) ? address : [address];
  const isInvalidAddress = (addr: any) =>
    typeof addr !== 'string' ||
    !allowedLogsAddressMap[chainId].has(addr.toLowerCase());

  if (addresses.some(isInvalidAddress)) {
    rpcRequestBlocked.inc();
    throw new InvalidRequestError(`Address not allowed for eth_getLogs`);
  }
};

const methodValidators: Record<
  ValidatingMethodsType,
  (params: any, context: ValidatorContext) => void
> = {
  eth_call: validateEthCall,
  eth_getLogs: validateEthGetLogs,
};

const validateMethod = (
  method: ValidatingMethodsType,
  params: MethodParams[ValidatingMethodsType],
  context: ValidatorContext,
) => {
  const validator = methodValidators[method];
  if (validator) {
    validator(params, context);
  }
};

type ValidateRequestContentParams = {
  req: NextApiRequest;
  allowedRPCMethods: string[];
  rpcRequestBlocked: Counter<string>;
  allowedCallAddressMap: Record<string, Set<string>>;
  allowedLogsAddressMap: Record<string, Set<string>>;
  chainId: number;
  disallowEmptyAddressGetLogs: boolean;
  maxBatchCount?: number;
};

const validateRequestContent = ({
  req,
  allowedRPCMethods,
  rpcRequestBlocked,
  allowedCallAddressMap,
  allowedLogsAddressMap,
  chainId,
  disallowEmptyAddressGetLogs,
  maxBatchCount,
}: ValidateRequestContentParams) => {
  const content = Array.isArray(req.body) ? req.body : [req.body];

  if (typeof maxBatchCount === 'number' && content.length > maxBatchCount) {
    throw new InvalidRequestError(`Too many batched requests`);
  }

  const context: ValidatorContext = {
    allowedCallAddressMap,
    allowedLogsAddressMap,
    chainId,
    rpcRequestBlocked,
    disallowEmptyAddressGetLogs,
  };

  for (const { method, params } of content) {
    if (typeof method !== 'string') {
      throw new InvalidRequestError(`RPC method isn't string`);
    }

    if (!allowedRPCMethods.includes(method)) {
      rpcRequestBlocked.inc();
      throw new InvalidRequestError(`RPC method ${method} isn't allowed`);
    }

    validateMethod(method as ValidatingMethodsType, params, context);
  }
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
};

const createAllowedAddressMap = (
  addresses: Record<number, string[]>,
): Record<string, Set<string>> => {
  return Object.entries(addresses).reduce(
    (acc, [chainId, addressList]) => {
      acc[chainId] = new Set(addressList.map((a) => a.toLowerCase()));
      return acc;
    },
    {} as Record<string, Set<string>>,
  );
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
  disallowEmptyAddressGetLogs = false,
}: RPCFactoryParams) => {
  const rpcRequestBlocked = new Counter({
    name: prefix + 'rpc_service_request_blocked',
    help: 'RPC service request blocked',
    labelNames: [],
    registers: [],
  });
  registry.registerMetric(rpcRequestBlocked);

  const allowedCallAddressMap = createAllowedAddressMap(allowedCallAddresses);
  const allowedLogsAddressMap = createAllowedAddressMap(allowedLogsAddresses);

  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      // Accept only POST requests
      if (req.method !== HTTP_METHOD_POST) {
        // We don't care about tracking blocked requests here
        throw new UnsupportedHTTPMethodError();
      }

      const chainId = Number(req.query.chainId || defaultChain);

      // Allow only chainId of specified chains
      if (providers[chainId] == null) {
        // We don't care about tracking blocked requests here
        throw new UnsupportedChainIdError();
      }

      // Validate request content
      validateRequestContent({
        req,
        allowedRPCMethods,
        rpcRequestBlocked,
        allowedCallAddressMap,
        allowedLogsAddressMap,
        chainId,
        disallowEmptyAddressGetLogs,
        maxBatchCount,
      });

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
      if (error instanceof ClientError) {
        res.status(400).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else if (error instanceof Error) {
        // TODO: check if there are errors duplication with iterateUrls
        console.error(error.message ?? DEFAULT_API_ERROR_MESSAGE);
        res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else {
        res.status(500).json(HEALTHY_RPC_SERVICES_ARE_OVER);
      }
    }
  };
};
