import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';

import { config, secretConfig } from 'config';
import { API_ROUTES } from 'consts/api';
import { API } from 'types';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  responseTimeExternalMetricWrapper,
  httpMethodGuard,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { standardFetcher } from 'utils/standardFetcher';

const TIMEOUT = 10_000;

const rewards: API = async (req, res) => {
  if (!req.query.address) {
    res.status(400).json({ status: 'invalid request' });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(
      `rewards backend api request was aborted for address ${req.query.address} because it took longer 10 sec`,
    );
    controller.abort();
  }, TIMEOUT);

  const query = req.query;
  const params = new URLSearchParams();

  Object.entries(query).forEach(
    ([k, v]) =>
      v && params.append(k, Array.isArray(v) ? v[0].toString() : v.toString()),
  );

  const result = await responseTimeExternalMetricWrapper({
    payload: secretConfig.rewardsBackendAPI,
    request: () =>
      standardFetcher(
        `${secretConfig.rewardsBackendAPI}/?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        },
      ),
  });

  res.status(200).json(result);

  clearTimeout(timeoutId);
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.REWARDS),
  cacheControl({ headers: config.CACHE_REWARDS_HEADERS }),
  defaultErrorHandler,
])(rewards);
