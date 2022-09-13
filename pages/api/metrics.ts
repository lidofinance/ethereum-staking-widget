import { NextApiRequest, NextApiResponse } from 'next';
import { serverLogger } from 'utilsApi/serverLogger';
import getConfig from 'next/config';
import { registry } from 'utilsApi/metrics';
const {
  serverRuntimeConfig: { metricsPort },
} = getConfig();

export const DEFAULT_API_ERROR_MESSAGE =
  'Something went wrong. Sorry, try again later :(';

const metrics = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
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
      const metrics = await registry.metrics();
      res.send(metrics);
    }
  } catch (error) {
    serverLogger.error(error);
    const errorMessage =
      error instanceof Error && error.message != null
        ? error.message
        : DEFAULT_API_ERROR_MESSAGE;
    res.status(500).json(errorMessage);
  }
};

export default metrics;
