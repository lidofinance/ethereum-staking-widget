import {
  providerFactory,
  StaticJsonRpcBatchProvider,
  trackedJsonRpcProvider,
} from 'backend-blocks/providers';
import { registry } from './metrics';
import { METRICS_PREFIX } from '../config';

export const getStaticRpcBatchProvider = providerFactory(
  trackedJsonRpcProvider({
    prefix: METRICS_PREFIX,
    registry,
    Provider: StaticJsonRpcBatchProvider,
  }),
);
