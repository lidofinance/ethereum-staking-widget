import { NextApiRequest, NextApiResponse } from 'next';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics();

export default async function metrics(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  res.setHeader('Content-type', register.contentType);
  const defaultMetrics = await register.metrics();
  res.send(defaultMetrics);
}
