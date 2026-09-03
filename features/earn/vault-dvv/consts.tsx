import type { Address } from 'viem';
import { PartnerMellowIcon, PartnerSteakhouseIcon } from 'assets/earn';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import type { DVVDepositTokens } from './deposit/types';

// Pure (server-importable) values live in consts-data.ts; re-exported here
// so frontend import sites keep working unchanged.
export * from './consts-data';

export const DVV_TOKEN_SYMBOL = TOKEN_SYMBOLS.dvsteth;

export const OBOL_TOKEN_SYMBOL = 'OBOL';
export const SSV_TOKEN_SYMBOL = 'SSV';

export const MELLOW_POINT_SYMBOL = 'Mellow';

export const DVV_DEPOSIT_TOKENS = ['ETH', 'WETH'] as DVVDepositTokens[];

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

export const DVV_VAULT_DESCRIPTION =
  'Lido DVV provides staking rewards boosted by Distributed Validator Technology incentives while supporting Lido Node Operator decentralization.';
