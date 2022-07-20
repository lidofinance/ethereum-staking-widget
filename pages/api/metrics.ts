import { registry } from 'utilsApi/metrics';
import { metricsFactory } from '@lidofinance/api-pages';

const metrics = metricsFactory({
  registry,
});

export default metrics;
