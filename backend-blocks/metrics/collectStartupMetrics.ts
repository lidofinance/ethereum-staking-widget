import { Gauge, Registry } from 'prom-client';

export const chainConfigFactory = (prefix: string) =>
  new Gauge({
    name: prefix + 'chain_config_info',
    help: 'Default network and supported networks',
    labelNames: ['default_chain', 'supported_chains'],
    registers: [],
  });

export const buildInfoFactory = (prefix: string) =>
  new Gauge({
    name: prefix + 'build_info',
    help: 'Version, branch and commit of the current build',
    labelNames: ['version', 'commit', 'branch'],
    registers: [],
  });

export type TrackStartupMetricsParameters = {
  prefix: string;
  registry: Registry;
  defaultChain: string;
  suppoertedChains: string[];
  version: string;
  commit: string;
  branch: string;
};
export const collectStartupMetrics = ({
  prefix,
  registry,
  defaultChain,
  suppoertedChains,
  version,
  commit,
  branch,
}: TrackStartupMetricsParameters) => {
  const chainConfig = chainConfigFactory(prefix);
  registry.registerMetric(chainConfig);
  chainConfig.labels({ default_chain: defaultChain }).set(1);
  suppoertedChains.forEach((chain) => {
    chainConfig.labels({ supported_chains: chain }).set(1);
  });

  const buildInfo = buildInfoFactory(prefix);
  registry.registerMetric(buildInfo);
  buildInfo.labels(version, commit, branch).set(1);
};
