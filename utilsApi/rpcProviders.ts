import {
  providerFactory,
  patchRPCProviderWithMetrics,
} from '../backend-blocks/providers';
import { registry } from './metrics';
import { StaticJsonRpcBatchProvider } from '../backend-blocks/providers';
import { METRICS_PREFIX } from '../config';

const StaticJsonRpcBatchProviderWithMetrics = patchRPCProviderWithMetrics({
  metrics: {
    prefix: METRICS_PREFIX,
    registry,
  },
  Provider: StaticJsonRpcBatchProvider,
});

export const getStaticRpcBatchProvider = providerFactory(
  StaticJsonRpcBatchProviderWithMetrics,
);
