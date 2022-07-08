import { NextApiRequest, NextApiResponse } from 'next';
import { Registry } from 'prom-client';

export type MetricsFactoryParams = {
  metrics: {
    registry: Registry;
  };
};

export const metricsFactory =
  ({ metrics: { registry } }: MetricsFactoryParams) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const collectedMetrics = await registry.metrics();
    res.send(collectedMetrics);
  };
