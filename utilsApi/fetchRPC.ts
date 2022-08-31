import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';
import Metrics from './metrics';
import { METRICS_PREFIX } from '../config';

export const fetchRPC = trackedFetchRpcFactory({
  registry: Metrics.registry,
  prefix: METRICS_PREFIX,
});
