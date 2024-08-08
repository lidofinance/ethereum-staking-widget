import { NextApiRequest, NextApiResponse } from 'next';

export type API<T = void> = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<T>;
