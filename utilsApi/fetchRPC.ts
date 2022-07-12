import { trackedFetchRpcFactory } from 'backend-blocks/fetch';
import { registry } from './metrics';
import { METRICS_PREFIX } from '../config';

export const fetchRPC = trackedFetchRpcFactory({
  registry,
  prefix: METRICS_PREFIX,
});
