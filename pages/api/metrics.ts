import { registry } from 'utilsApi/metrics';
import { metricsFactory } from 'backend-blocks/pages';

const metrics = metricsFactory({
  registry,
});

export default metrics;
