import { NextApiRequest, NextApiResponse } from 'next';

export type API = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
