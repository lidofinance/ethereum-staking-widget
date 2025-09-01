import { PartnerMellowIcon, PartnerSteakhouseIcon } from 'assets/earn';
import type { DVV_DEPOSIT_TOKENS } from './deposit/types';
import type { Address } from 'viem';

export const DVV_TOKEN_SYMBOL = 'DVstETH';

export const OBOL_TOKEN_SYMBOL = 'OBOL';
export const SSV_TOKEN_SYMBOL = 'SSV';

export const MELLOW_POINT_SYMBOL = 'Mellow';

export const DVV_DEPOSABLE_TOKENS = ['ETH', 'wETH'] as DVV_DEPOSIT_TOKENS[];

export const SSV_CLAIM_URL = (address: Address) =>
  `https://www.ssvrewards.com/?address=${address.toLowerCase()}&tab=lido`;

export const OBOL_CLAIM_URL = (address: Address) =>
  `https://launchpad.obol.org/cluster/list/?address=${address.toLowerCase()}/`;

export const DVV_PARTNERS = [
  {
    role: 'Curated by',
    icon: <PartnerSteakhouseIcon />,
    text: 'Steakhouse Financial',
  },
  {
    role: 'Infra provider',
    icon: <PartnerMellowIcon />,
    text: 'Mellow',
  },
];
