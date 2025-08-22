import { PartnerMellowIcon, PartnerStakehouseIcon } from 'assets/earn';
import type { DVV_DEPOSIT_TOKENS } from './deposit/types';

export const DVV_TOKEN_SYMBOL = 'DVstETH';

export const OBOL_TOKEN_SYMBOL = 'OBOL';
export const SSV_TOKEN_SYMBOL = 'SSV';

export const MELLOW_POINT_SYMBOL = 'Mellow';

export const DVV_DEPOSABLE_TOKENS = ['ETH', 'wETH'] as DVV_DEPOSIT_TOKENS[];

export const DVV_PARTNERS = [
  {
    role: 'Curated by',
    icon: <PartnerStakehouseIcon />,
    text: 'Stakehouse Financial',
  },
  {
    role: 'Infra provider',
    icon: <PartnerMellowIcon />,
    text: 'Mellow',
  },
];
