import { NextApiRequest, NextApiResponse } from 'next';
import { collectDefaultMetrics, register } from 'prom-client';
import { METRICS_PREFIX } from 'config';
import { collectBuildInfo, collectChainConfig } from 'utils/metrics';

type Metrics = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

collectDefaultMetrics({ prefix: METRICS_PREFIX });

const metrics: Metrics = async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    // Clear the register to avoid errors on Hot Reload
    register.clear();
  }

  collectBuildInfo();
  collectChainConfig();

  res.setHeader('Content-type', register.contentType);
  const allMetrics = await register.metrics();
  res.send(allMetrics);
};

export default metrics;
