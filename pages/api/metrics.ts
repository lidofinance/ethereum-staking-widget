import { registry } from 'utilsApi/metrics';
import { metricsFactory } from '@lidofinance/widget-blocks';

const metrics = metricsFactory({
  registry,
});

export default metrics;
