import { TOKEN_SYMBOLS } from 'consts/tokens';
import { PartnerMellowIcon } from 'assets/earn';

// Pure (server-importable) values live in consts-data.ts; re-exported here
// so frontend import sites keep working unchanged.
export * from './consts-data';

export const STG_TOKEN_SYMBOL = TOKEN_SYMBOLS.streth;

export const STG_DEPOSIT_TOKENS = ['ETH', 'WETH', 'wstETH'] as const;

export const STG_VAULT_DESCRIPTION =
  'Lido stRATEGY gives users exposure to a range of leading DeFi protocols targeting increased rewards, plus additional Mellow points';

export const STG_PARTNERS = [
  {
    role: 'Curated by',
    icon: <PartnerMellowIcon />,
    text: 'Mellow',
  },
  { role: 'Infra provider', icon: <PartnerMellowIcon />, text: 'Mellow' },
];

export const MELLOW_POINT_SYMBOL = 'Mellow';
