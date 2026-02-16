import { maxUint112, maxUint24, parseEther } from 'viem';
import { PartnerVedaIcon } from 'assets/earn';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import type { GGVDepositTokens } from './deposit/form-context/types';

export const GGV_TOKEN_SYMBOL = TOKEN_SYMBOLS.gg;

export const GGV_DEPOSIT_TOKENS: GGVDepositTokens[] = [
  'ETH',
  'wETH',
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

export const GGV_START_DATE = new Date('2025-09-03');

export const GGV_INCENTIVES = [
  parseEther('57.5'),
  parseEther('32'),
  parseEther('38.5'),
];

export const GGV_STATS_ORIGIN = 'https://api.sevenseas.capital';
