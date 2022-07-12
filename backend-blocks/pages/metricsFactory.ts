import { NextApiRequest, NextApiResponse } from 'next';
import { Registry } from 'prom-client';

export type MetricsFactoryParameters = {
  registry: Registry;
};

export const metricsFactory =
  ({ registry }: MetricsFactoryParameters) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const collectedMetrics = await registry.metrics();
    res.send(collectedMetrics);
  };
