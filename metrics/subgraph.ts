import { Histogram, Registry } from 'prom-client';
import { METRICS_PREFIX } from 'config';

export class SubgraphMetrics {
  subgraphsResponseTime: Histogram<'subgraphs'>;

  constructor(public registry: Registry) {
    this.subgraphsResponseTime = this.subgraphsResponseTimeInit();
  }

  subgraphsResponseTimeInit() {
    const subgraphsResponseTimeName = METRICS_PREFIX + 'subgraphs_response';

    return new Histogram({
      name: subgraphsResponseTimeName,
      help: 'Subgraphs response time seconds',
      buckets: [0.1, 0.2, 0.3, 0.6, 1, 1.5, 2, 5],
      registers: [this.registry],
    });
  }
}
