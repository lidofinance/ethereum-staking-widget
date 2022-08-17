import { registry } from 'utilsApi/metrics';
import { metricsFactory } from '@lidofinance/next-pages';

const metrics = metricsFactory({
  registry,
});

export default metrics;
