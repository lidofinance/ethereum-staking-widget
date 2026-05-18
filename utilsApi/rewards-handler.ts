import type { NextApiRequest, NextApiResponse } from 'next';
import type { API } from '@lidofinance/next-api-wrapper';

import { rewardsQuerySchema } from './rewards-query-schema';

/**
 * `/api/rewards` handler: validates query against `rewardsQuerySchema`,
 * returns 400 with structured `details` on failure, forwards to `proxy` otherwise.
 * Factory form keeps the proxy injectable for tests.
 */
export const createRewardsHandler =
  (proxy: API): API =>
  (req: NextApiRequest, res: NextApiResponse) => {
    const parsed = rewardsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }
    return proxy(req, res);
  };
