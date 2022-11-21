import { NextApiRequest, NextApiResponse } from 'next';
import { wrapRequest as wrapNextRequest } from '@lidofinance/next-api-wrapper';
import Metrics from 'utilsApi/metrics';
import { API_ROUTES } from 'config';
import {
  responseTimeMetric,
  errorAndCacheDefaultWrappers,
  rateLimit,
} from 'utilsApi';
import getConfig from 'next/config';
const {
  serverRuntimeConfig: { metricsPort },
} = getConfig();

const metrics = async (_req: NextApiRequest, res: NextApiResponse) => {
  if (process.env.NODE_ENV === 'production') {
    // In production mode we are running cluster, so we need to get cluster metrics
    const requested = await fetch(`http://localhost:${metricsPort}`);

    res.setHeader(
      'Content-Type',
      requested.headers.get('Content-Type') ?? 'text/plain',
    );
    res.status(requested.status).send(requested.body);
  } else {
    // In development mode it's ok to get metrics from current instance
    const metrics = await Metrics.registry.metrics();
    res.send(metrics);
  }
};

export default wrapNextRequest([
  rateLimit(),
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.METRICS),
  ...errorAndCacheDefaultWrappers,
])(metrics);
