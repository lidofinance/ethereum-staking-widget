import type { NextApiRequest, NextApiResponse } from 'next';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { isAddress } from 'viem';

import { config, secretConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { createCachedProxy } from 'utilsApi/cached-proxy';
import { getExternalConfig } from 'utilsApi/get-external-config';

// Validate address to prevent SSRF attacks
const validateEthereumAddress = (address: unknown): string | null => {
  if (typeof address !== 'string' || !address) return null;
  if (!isAddress(address)) return null;

  return address.toLowerCase();
};

let handler;
if (!secretConfig.validationAPI) {
  console.info(
    '[api/validation] Skipped setup: secretConfig.validationAPI is null',
  );
  handler = (_: NextApiRequest, res: NextApiResponse) => {
    res.status(404).end();
  };
} else {
  // Create proxy once at module level to preserve cache
  const validationProxy = createCachedProxy({
    proxyUrl: async (req) => {
      const manifestConfig = await getExternalConfig();

      // default to version 1 if not set
      const version = manifestConfig?.config.api?.validation?.version || '1';

      const validatedAddress = validateEthereumAddress(req.query.address);
      if (!validatedAddress) throw new Error('Invalid address'); // This will be caught by the handler

      const url =
        secretConfig.validationAPI + `/v${version}/check/${validatedAddress}`;

      return url;
    },
    cacheTTL: 1000,
    ignoreParams: true, // Address is in path, not query
    timeout: 10_000,
    metricsHost: secretConfig.validationAPI,
  });

  handler = (req: NextApiRequest, res: NextApiResponse) => {
    const validatedAddress = validateEthereumAddress(req.query.address);

    if (!validatedAddress) {
      res.status(400).json({
        error: 'Invalid Ethereum address',
        message: 'Address must be a valid Ethereum address format',
      });
      return;
    }

    return validationProxy(req, res);
  };
}

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.VALIDATION),
  cacheControl({ headers: config.CACHE_VALIDATION_HEADERS }),
  defaultErrorHandler,
])(handler);
