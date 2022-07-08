import { NextApiRequest, NextApiResponse } from 'next';

export const health = (req: NextApiRequest, res: NextApiResponse): void => {
  res.status(200).send({ status: 'ok' });
};
