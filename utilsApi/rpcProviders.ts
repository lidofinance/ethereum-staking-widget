import {
  providerFactory,
  StaticJsonRpcBatchProvider,
} from '@lidofinance/eth-providers';
import { trackedJsonRpcProvider } from '@lidofinance/eth-api-providers';

import { METRICS_PREFIX } from 'consts/metrics';
import Metrics from 'utilsApi/metrics';

export const getStaticRpcBatchProvider = providerFactory(
  trackedJsonRpcProvider({
    prefix: METRICS_PREFIX,
    registry: Metrics.registry,
    Provider: StaticJsonRpcBatchProvider,
  }),
);
