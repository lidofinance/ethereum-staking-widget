import { parseEther } from 'viem';

import { PartnerVedaIcon } from 'assets/earn';

export const STG_TOKEN_SYMBOL = 'STG';

export const STG_DEPOSABLE_TOKENS = ['ETH', 'wETH', 'stETH', 'wstETH'] as const;

export const STG_VAULT_DESCRIPTION =
  'Lido STG (Starter Vault) is a placeholder vault used to onboard new strategies; implementation coming soon.';

export const STG_PARTNERS = [
  { role: 'Curated by', icon: <PartnerVedaIcon />, text: 'Veda' },
];

export const STG_START_DATE = new Date();

export const STG_INCENTIVES = [parseEther('0')];
