import { Gauge } from 'prom-client';

type ChainConfig = Gauge<'default_chain' | 'supported_chains'>;

type ChainConfigProps = {
  defaultChain: string;
  supportedChains: string | unknown;
};

export const trackChainConfig = (
  prefix: string,
  options: ChainConfigProps,
): ChainConfig => {
  const metric = new Gauge({
    name: prefix + 'chain_config_info',
    help: 'Default network and supported networks',
    labelNames: ['default_chain', 'supported_chains'],
    registers: [],
  });

  metric.labels({ default_chain: options.defaultChain }).set(1);
  if (typeof options.supportedChains === 'string') {
    options.supportedChains.split(',').forEach((chain) => {
      metric.labels({ supported_chains: chain }).set(1);
    });
  }
  return metric;
};
