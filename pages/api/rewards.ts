import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { dynamics } from 'config';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  responseTimeExternalMetricWrapper,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { CACHE_REWARDS_HEADERS, API_ROUTES } from 'config';
import { API } from 'types';
import { standardFetcher } from 'utils/standardFetcher';

const TIMEOUT = 10_000;

const rewards: API = async (req, res) => {
  if (!req.query.address) {
    res.status(400).json({ status: 'invalid request' });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  const query = req.query;
  const params = new URLSearchParams();

  Object.entries(query).forEach(
    ([k, v]) =>
      v && params.append(k, Array.isArray(v) ? v[0].toString() : v.toString()),
  );

  const result = await responseTimeExternalMetricWrapper({
    payload: dynamics.rewardsBackendAPI,
    request: () =>
      standardFetcher(`${dynamics.rewardsBackendAPI}/?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }),
  });

  res.status(200).send(result);

  clearTimeout(timeoutId);
};

export default wrapNextRequest([
  rateLimit(),
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.REWARDS),
  cacheControl({ headers: CACHE_REWARDS_HEADERS }),
  defaultErrorHandler,
])(rewards);
