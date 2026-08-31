import type { NextApiRequest, NextApiResponse } from 'next';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config, secretConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  cors,
  defaultErrorHandler,
  HttpMethod,
  httpMethodGuard,
  rateLimit,
  responseTimeMetric,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { createOneInchRateHandler } from 'utilsApi/one-inch-rate-handler';

const handler = secretConfig.oneInchAPIKey
  ? createOneInchRateHandler({ apiKey: secretConfig.oneInchAPIKey })
  : (_: NextApiRequest, res: NextApiResponse) => {
      res.setHeader('Cache-Control', config.CACHE_DEFAULT_ERROR_HEADERS);
      res.status(404).end();
    };

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.SWAP_ONE_INCH),
  cacheControl({ headers: config.CACHE_ONE_INCH_RATE_HEADERS }),
  defaultErrorHandler,
])(handler);
