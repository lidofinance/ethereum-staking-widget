import { trackedFetchRpcFactory } from '@lidofinance/api-rpc';
import { METRICS_PREFIX } from 'consts/metrics';
import Metrics from 'utilsApi/metrics';

export const fetchRPC = trackedFetchRpcFactory({
  registry: Metrics.registry,
  prefix: METRICS_PREFIX,
});
