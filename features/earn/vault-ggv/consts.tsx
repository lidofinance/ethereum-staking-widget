import { maxUint112, maxUint24 } from 'viem';
import { PartnerVedaIcon } from 'assets/earn';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import type { GGVDepositTokens } from './deposit/form-context/types';

// Pure (server-importable) values live in consts-data.ts; re-exported here
// so frontend import sites keep working unchanged.
export * from './consts-data';

export const GGV_TOKEN_SYMBOL = TOKEN_SYMBOLS.gg;

export const GGV_DEPOSIT_TOKENS: GGVDepositTokens[] = [
  'ETH',
  'WETH',
  'stETH',
  'wstETH',
];

export const INFINITE_DEPOSIT_CAP = maxUint112;
export const MAX_REQUEST_DEADLINE = Number(maxUint24);

export const GGV_VAULT_DESCRIPTION =
  'Lido GGV (Golden Goose Vault) utilizes tried and tested strategies with premier DeFi protocols for increased rewards on deposits of ETH or (w)stETH.';

export const GGV_PARTNERS = [
  { role: 'Curated by', icon: <PartnerVedaIcon />, text: 'Veda' },
  {
    role: 'Infra provider',
    icon: <PartnerVedaIcon />,
    text: 'Veda',
  },
];
