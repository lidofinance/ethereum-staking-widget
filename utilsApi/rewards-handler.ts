import type { NextApiRequest, NextApiResponse } from 'next';
import type { API } from '@lidofinance/next-api-wrapper';

import { rewardsQuerySchema } from './rewards-query-schema';

/**
 * Returns the `/api/rewards` request handler. The handler runs the zod
 * `rewardsQuerySchema` first — on validation failure it responds with `400`
 * and a structured `details` payload listing each schema issue. On success
 * it forwards the request to the cached proxy.
 *
 * Extracted into a factory so it can be unit-tested without going through
 * the `wrapNextRequest([...])` middleware chain or instantiating an actual
 * cached proxy with live upstream config.
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
