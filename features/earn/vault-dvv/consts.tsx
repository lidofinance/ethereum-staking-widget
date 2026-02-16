import type { Address } from 'viem';
import { PartnerMellowIcon, PartnerSteakhouseIcon } from 'assets/earn';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import type { DVVDepositTokens } from './deposit/types';

export const DVV_TOKEN_SYMBOL = TOKEN_SYMBOLS.dvsteth;

export const OBOL_TOKEN_SYMBOL = 'OBOL';
export const SSV_TOKEN_SYMBOL = 'SSV';

export const MELLOW_POINT_SYMBOL = 'Mellow';

export const DVV_DEPOSIT_TOKENS = ['ETH', 'wETH'] as DVVDepositTokens[];

export const SSV_CLAIM_URL = (address: Address) =>
  `https://www.ssvrewards.com/?address=${address.toLowerCase()}&tab=lido`;

export const OBOL_CLAIM_URL = (address: Address) =>
  `https://launchpad.obol.org/cluster/list/?address=${address.toLowerCase()}/`;

export const DVV_STATS_ORIGIN = 'https://api.mellow.finance';
export const DVV_APR_ENDPOINT = `${DVV_STATS_ORIGIN}/v1/vaults`;

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

export const DVV_VAULT_DESCRIPTION =
  'Lido DVV provides staking rewards boosted by Distributed Validator Technology incentives while supporting Lido Node Operator decentralization.';
