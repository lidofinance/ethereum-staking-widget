import {
  providerFactory,
  StaticJsonRpcBatchProvider,
  trackedJsonRpcProvider,
} from '@lidofinance/widget-blocks';
import { registry } from './metrics';
import { METRICS_PREFIX } from '../config';

export const getStaticRpcBatchProvider = providerFactory(
  trackedJsonRpcProvider({
    prefix: METRICS_PREFIX,
    registry,
    Provider: StaticJsonRpcBatchProvider,
  }),
);
