import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';
import { registry } from './metrics';
import { METRICS_PREFIX } from '../config';

export const fetchRPC = trackedFetchRpcFactory({
  registry,
  prefix: METRICS_PREFIX,
});
