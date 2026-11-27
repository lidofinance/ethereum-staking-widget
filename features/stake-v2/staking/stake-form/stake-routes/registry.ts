import { createRouteRegistry } from '../../../utils';

import { fastStakeRoute } from './routes/fast-stake';
import { stakeRoute } from './routes/stake';
import { wrapEthRoute } from './routes/wrap-eth';
import type { StakeRouteSpec } from './types';

// A new route is a folder in routes/ implementing StakeRoute, listed here.
// First match wins
const registry = createRouteRegistry<StakeRouteSpec>([
  stakeRoute,
  wrapEthRoute,
  fastStakeRoute,
]);

/** the route that turns `tokenIn` into `tokenOut`; null when none can */
export const resolveStakeRoute = registry.resolve;
export const isRoutable = registry.isRoutable;
