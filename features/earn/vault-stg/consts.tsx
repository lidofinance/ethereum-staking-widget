import { PartnerMellowIcon } from 'assets/earn';

export const STG_TOKEN_SYMBOL = 'strETH';

export const STG_DEPOSABLE_TOKENS = ['ETH', 'wETH', 'wstETH'] as const;

export const STG_VAULT_DESCRIPTION =
  'stRATEGY Vault Description placeholder; implementation coming soon.';

export const STG_PARTNERS = [
  {
    role: 'Curated by',
    icon: <PartnerMellowIcon />,
    text: 'Mellow',
  },
  { role: 'Infra provider', icon: <PartnerMellowIcon />, text: 'Mellow' },
];

export const MELLOW_POINT_SYMBOL = 'Mellow';

export const STG_COLLECTOR_CONFIG = {
  baseAssetFallback: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  oracleUpdateInterval: 86400n,
  redeemHandlingInterval: 3600n,
} as const;
