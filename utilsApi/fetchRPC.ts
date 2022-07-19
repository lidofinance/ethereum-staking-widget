import { trackedFetchRpcFactory } from '@lidofinance/widget-blocks';
import { registry } from './metrics';
import { METRICS_PREFIX } from '../config';

export const fetchRPC = trackedFetchRpcFactory({
  registry,
  prefix: METRICS_PREFIX,
});
