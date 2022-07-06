import { NextApiRequest, NextApiResponse } from 'next';

// TODO: move to common endpoints
export default function health(
  req: NextApiRequest,
  res: NextApiResponse,
): void {
  res.status(200).send({ status: 'ok' });
}
