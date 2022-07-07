import { providerFactoryWithMetrics } from '../backend-blocks/providers';
import { METRICS_PREFIX } from '../config';
import { registry } from './metrics';
import { StaticJsonRpcBatchProvider } from '../backend-blocks/providers';

export const getStaticRpcBatchProvider = providerFactoryWithMetrics(
  METRICS_PREFIX,
  registry,
  StaticJsonRpcBatchProvider,
);
