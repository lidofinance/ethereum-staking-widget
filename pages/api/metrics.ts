import Metrics from 'utilsApi/metrics';
import { metricsFactory } from '@lidofinance/next-pages';

const metrics = metricsFactory({
  registry: Metrics.registry,
});

export default metrics;
