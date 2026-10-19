import { CHAINS, config } from 'config';

// Filter values are the labels used by lido.fi/lido-ecosystem (matched case-insensitively there)
export type LidoEcosystemToken = 'stETH' | 'wstETH' | 'LDO';
export type LidoEcosystemCategory =
  'Get' | 'Earn' | 'Hold' | 'Analyze' | 'Cover';
export type LidoEcosystemCriteria = 'and' | 'or';

export type LidoEcosystemPathArgs = {
  tokens?: LidoEcosystemToken[];
  categories?: LidoEcosystemCategory[];
  /** mapped to ecosystem network labels; chains without a known label are skipped */
  chainIds?: number[];
  criteria?: LidoEcosystemCriteria;
};

// Network labels on lido.fi/lido-ecosystem keyed by chain id (BNB has no CHAINS entry)
const LIDO_ECOSYSTEM_NETWORKS: Partial<Record<number, string>> = {
  [CHAINS.Mainnet]: 'Ethereum',
  [CHAINS.Arbitrum]: 'Arbitrum',
  [CHAINS.Optimism]: 'OP Mainnet',
  [CHAINS.Base]: 'Base',
  [CHAINS.Linea]: 'Linea',
  [CHAINS.Unichain]: 'Unichain',
};

// Mirrors the ecosystem page's own serializer: lowercased labels joined by comma.
// URLSearchParams encodes the space in "op mainnet" as "+", which the page decodes back.
const serialize = (labels: string[]) =>
  labels.map((label) => label.toLowerCase()).join(',');

export const lidoEcosystemPath = ({
  tokens,
  categories,
  chainIds,
  criteria,
}: LidoEcosystemPathArgs = {}): string => {
  const query = new URLSearchParams();

  const networks = (chainIds ?? [])
    .map((chainId) => LIDO_ECOSYSTEM_NETWORKS[chainId])
    .filter((label): label is string => !!label);

  if (networks.length > 0) query.set('networks', serialize(networks));
  if (tokens && tokens.length > 0) query.set('tokens', serialize(tokens));
  if (categories && categories.length > 0)
    query.set('categories', serialize(categories));
  if (criteria) query.set('criteria', criteria);

  const search = query.toString();
  const path = `${config.rootOrigin}/lido-ecosystem`;
  return search ? `${path}?${search}` : path;
};
