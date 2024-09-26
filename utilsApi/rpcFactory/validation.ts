import { Counter } from 'prom-client';
import { ClientError, InvalidRequestError, SizeTooLargeError } from './errors';
import { Cache } from 'memory-cache';

import type { FetchRpcInitBody } from '@lidofinance/rpc';
import { BigNumber } from 'ethers';
import { Zero } from '@ethersproject/constants';
import { Transform } from 'node:stream';

type RpcRequest = {
  method: string;
  params: unknown[];
};

type ValidationContext = {
  chainId: number;
  rpcRequestBlocked: Counter<never>;
  requestRPC: (chainId: number, body: FetchRpcInitBody) => Promise<Response>;
};

export const rpcMethodsValidation = (allowedMethods: string[]) => {
  const methodsMap = new Set(allowedMethods);

  return (request: RpcRequest, context: ValidationContext) => {
    const method = request.method;
    if (typeof method !== 'string') {
      throw new InvalidRequestError(`RPC method isn't string`);
    }
    if (!methodsMap.has(request.method)) {
      context.rpcRequestBlocked.inc();
      throw new InvalidRequestError(`RPC method ${method} not allowed`);
    }
  };
};

export const ethCallValidation = (allowedAddress: Record<number, string[]>) => {
  const allowedCallAddressMap = Object.entries(allowedAddress).reduce(
    (acc, [chainId, addresses]) => {
      acc[chainId] = new Set(addresses.map((a) => a.toLowerCase()));
      return acc;
    },
    {} as Record<string, Set<string>>,
  );

  return (
    request: RpcRequest,
    { chainId, rpcRequestBlocked }: ValidationContext,
  ) => {
    const { params } = request;
    if (
      Array.isArray(params) &&
      params[0] &&
      typeof params[0] === 'object' &&
      'to' in params[0] &&
      typeof params[0].to === 'string'
    ) {
      if (!allowedCallAddressMap[chainId]?.has(params[0].to.toLowerCase())) {
        rpcRequestBlocked.inc();
        throw new InvalidRequestError(`Address not allowed for eth_call`);
      }
    } else throw new InvalidRequestError(`RPC method eth_call is invalid`);
  };
};

export const ethGetLogsValidation = (
  allowedAddress: Record<number, string[]>,
  maxBlockRange: BigNumber = BigNumber.from(20_000),
  currentBlockTTL = 60_000,
) => {
  const allowedAddressMap = Object.entries(allowedAddress).reduce(
    (acc, [chainId, addresses]) => {
      acc[chainId] = new Set(addresses.map((a) => a.toLowerCase()));
      return acc;
    },
    {} as Record<string, Set<string>>,
  );

  const currentBlock = new Cache<number, BigNumber>();

  return async (
    request: RpcRequest,
    { chainId, rpcRequestBlocked, requestRPC }: ValidationContext,
  ) => {
    try {
      // block range validation
      const params = request.params[0] as any;
      const fromBlock: string = params.fromBlock;
      const toBlock: string = params.toBlock ?? 'latest';

      if (fromBlock === 'earliest')
        throw new InvalidRequestError(
          `RPC method eth_getLogs fromBlock is invalid`,
        );

      const shouldValidateBlockDistance = fromBlock.startsWith('0x');

      if (shouldValidateBlockDistance) {
        const normalizedFromBlock = BigNumber.from(fromBlock);
        let normalizedToBlock: BigNumber;
        if (toBlock.startsWith('0x'))
          normalizedToBlock = BigNumber.from(toBlock);
        else {
          const cached = currentBlock.get(chainId);
          if (cached) {
            normalizedToBlock = cached;
          } else {
            normalizedToBlock = await requestRPC(chainId, {
              id: 1,
              jsonrpc: '2.0',
              method: 'eth_blockNumber',
            })
              .then((res) => res.json())
              .then((res) => BigNumber.from(res.result));
            currentBlock.put(chainId, normalizedToBlock, currentBlockTTL);
          }
        }
        const range = normalizedToBlock.sub(normalizedFromBlock);

        if (range.lt(Zero) || range.gt(maxBlockRange)) {
          rpcRequestBlocked.inc();
          throw new InvalidRequestError(
            `RPC method eth_getLogs range is invalid`,
          );
        }
      }

      // address validation
      const address: string | string[] = params.address;

      if (!address)
        throw new InvalidRequestError(
          `RPC method eth_getLogs address is invalid`,
        );

      const addresses = Array.isArray(address) ? address : [address];

      if (addresses.length === 0) {
        throw new InvalidRequestError(
          `RPC method eth_getLogs address is invalid`,
        );
      }
      if (
        addresses.some(
          (eventAddress) =>
            // needs this check before toLowerCase
            typeof eventAddress !== 'string' ||
            !allowedAddressMap[chainId]?.has(eventAddress.toLowerCase()),
        )
      ) {
        rpcRequestBlocked.inc();
        throw new InvalidRequestError(`Address not allowed for eth_getLogs`);
      }
    } catch (error) {
      if (error instanceof ClientError) throw error;
      throw new InvalidRequestError(`RPC method eth_getLogs is invalid`);
    }
  };
};

export const validateMaxSize = (MAX_SIZE: number) => {
  let bytesWritten = 0;
  return new Transform({
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
};
