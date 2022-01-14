import { NextApiRequest, NextApiResponse } from 'next';
import { serverLogger } from 'utilsApi';

export default function cspReport(
  req: NextApiRequest,
  res: NextApiResponse,
): void {
  serverLogger.warn({
    ...req.body,
    type: 'CSP',
  });

  res.status(200).send({ status: 'ok' });
}
