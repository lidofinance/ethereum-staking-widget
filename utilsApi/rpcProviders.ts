import {
  providerFactory,
  StaticJsonRpcBatchProvider,
} from '@lidofinance/eth-providers';
import { trackedJsonRpcProvider } from '@lidofinance/eth-api-providers';
import Metrics from 'utilsApi/metrics';
import { METRICS_PREFIX } from '../config';

export const getStaticRpcBatchProvider = providerFactory(
  trackedJsonRpcProvider({
    prefix: METRICS_PREFIX,
    registry: Metrics.registry,
    Provider: StaticJsonRpcBatchProvider,
  }),
);
