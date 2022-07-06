import { Gauge } from 'prom-client';

type BuildInfo = Gauge<'version' | 'commit' | 'branch'>;

type BuildInfoFactoryProps = {
  version: string;
  commit: string;
  branch: string;
};

export const trackBuildInfo = (
  prefix: string,
  options: BuildInfoFactoryProps,
): BuildInfo => {
  const metric = new Gauge({
    name: prefix + 'build_info',
    help: 'Version, branch and commit of the current build',
    labelNames: ['version', 'commit', 'branch'],
    registers: [],
  });

  metric.labels(options.version, options.commit, options.branch).set(1);
  return metric;
};
