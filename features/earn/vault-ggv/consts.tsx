import { maxUint112, maxUint24 } from 'viem';

import { Partner7SeasIcon, PartnerVedaIcon } from 'assets/earn';

import type { GGV_DEPOSIT_TOKENS } from './deposit/form-context/types';

export const GGV_TOKEN_SYMBOL = 'GG';

export const GGV_DEPOSABLE_TOKENS: GGV_DEPOSIT_TOKENS[] = [
  'ETH',
  'wETH',
  'stETH',
  'wstETH',
];

export const INFINITE_DEPOSIT_CAP = maxUint112;
export const MAX_REQUEST_DEADLINE = Number(maxUint24);

export const GGV_PARTNERS = [
  { role: 'Curated by', icon: <Partner7SeasIcon />, text: '7seas' },
  {
    role: 'Infra provider',
    icon: <PartnerVedaIcon />,
    text: 'Veda',
  },
];
