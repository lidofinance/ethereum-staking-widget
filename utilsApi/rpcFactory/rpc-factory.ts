import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { pipeline } from 'node:stream/promises';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Counter } from 'prom-client';
import type { FetchRpcInitBody } from '@lidofinance/rpc';
import { iterateUrls } from '@lidofinance/rpc';

import {
  DEFAULT_API_ERROR_MESSAGE,
  HEALTHY_RPC_SERVICES_ARE_OVER,
  ClientError,
} from './errors';
import {
  baseRequestValidationFactory,
  ethCallValidationFactory,
  ethGetLogsValidationFactory,
  rpcMethodsValidationFactory,
  streamMaxSizeValidationFactory,
} from './validation';
import { RPCFactoryParams } from './types';

export const rpcFactory = ({
  metrics,
  providers,
  fetchRPC,
  defaultChain,
  validation,
}: RPCFactoryParams) => {
  const {
    allowedRPCMethods,
    allowedCallAddresses,
    allowedLogsAddresses,
    maxResponseSize = 1_000_000,
    maxBatchCount = 20,
    currentBlockTTLms = 60_000,
    maxGetLogsRange = 20_000,
    blockEmptyAddressGetLogs = true,
  } = validation;

  // optional metrics
  const { registry, prefix = '' } = metrics ?? {};
  const rpcRequestBlocked = new Counter({
    name: prefix + 'rpc_service_request_blocked',
    help: 'RPC service request blocked',
    labelNames: ['reason'],
    registers: [],
  });
  registry && registry.registerMetric(rpcRequestBlocked);

  const validateBaseRequest = baseRequestValidationFactory(
    defaultChain,
    providers,
    maxBatchCount,
  );

  const validateRpcMethod = rpcMethodsValidationFactory(allowedRPCMethods);

  const validateEthCall =
    allowedCallAddresses &&
    (!allowedRPCMethods || allowedRPCMethods.includes('eth_call'))
      ? ethCallValidationFactory(allowedCallAddresses)
      : undefined;

  const validateEthGetLogs =
    (allowedLogsAddresses || blockEmptyAddressGetLogs) &&
    (!allowedRPCMethods || allowedRPCMethods.includes('eth_getLogs'))
      ? ethGetLogsValidationFactory(
          allowedLogsAddresses,
          blockEmptyAddressGetLogs,
          maxGetLogsRange,
          currentBlockTTLms,
        )
      : undefined;

  const validateMaxSteamSize = streamMaxSizeValidationFactory(maxResponseSize);

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
      const { chainId, requests } = validateBaseRequest(req);

      const validationContext = {
        chainId,
        rpcRequestBlocked,
        requestRPC,
      };

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

      const proxyedRPC = await requestRPC(
        chainId,
        req.body as FetchRpcInitBody,
      );

      res.setHeader(
        'Content-Type',
        proxyedRPC.headers.get('Content-Type') ?? 'application/json',
      );
      if (!proxyedRPC.body) {
        throw new Error('There are a problems with RPC provider');
      }

      // auto closes both Readable.fromWeb() and underlying proxyedRPC streams on error
      await pipeline(
        Readable.fromWeb(proxyedRPC.body as ReadableStream),
        validateMaxSteamSize(validationContext),
        res,
        {
          signal: abortController.signal,
        },
      );
    } catch (error) {
      if (error instanceof ClientError) {
        res.status(400).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
      } else if (error instanceof Error) {
        // TODO: check if there are errors duplication with iterateUrls
        console.error(
          '[rpcFactory]' + error.message ?? DEFAULT_API_ERROR_MESSAGE,
        );
        if (!res.headersSent) {
          res.status(500).json(error.message ?? DEFAULT_API_ERROR_MESSAGE);
        }
      } else {
        res.status(500).json(HEALTHY_RPC_SERVICES_ARE_OVER);
      }
    } finally {
      // forces pipeline closure in case of external error/abort
      abortController.abort();
    }
  };
};
