import { MATOMO_EARN_EVENTS_TYPES } from 'consts/matomo/matomo-earn-events';
import { TOKENS, TOKEN_SYMBOLS } from 'consts/tokens';
import { ETH_DEPOSIT_PATH, ETH_WITHDRAW_PATH } from '../consts';

export const ETH_VAULT_TITLE = 'EarnETH';
export const ETH_VAULT_DESCRIPTION =
  'EarnETH is an ETH growth vault allocating ETH and stETH across leading, blue-chip DeFi protocols meant to optimize for capital efficiency';

export const ETH_VAULT_TOKEN_SYMBOL = TOKEN_SYMBOLS.earneth;

const { eth, wsteth, weth, steth } = TOKEN_SYMBOLS;
export const ETH_VAULT_DEPOSIT_TOKEN_SYMBOLS_FORM = {
  eth,
  wsteth,
  weth,
  steth,
} as const;

export const ETH_VAULT_DEPOSIT_TOKENS_FORM = [
  TOKENS.eth,
  TOKENS.weth,
  TOKENS.wsteth,
  TOKENS.steth,
] as const;

// Tokens not available for direct deposit via deposit form,
// but a user can upgrade the whole amount of them via one "upgrade" action
export const ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE = [
  TOKENS.gg,
  TOKENS.streth,
  TOKENS.dvsteth,
] as const;

export const ETH_VAULT_DEPOSIT_TOKENS = [
  ...ETH_VAULT_DEPOSIT_TOKENS_FORM,
  ...ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE,
] as const;

export const ETH_VAULT_QUERY_SCOPE = 'earn-vault-eth';

export const ETH_VAULT_STATS_ORIGIN = 'https://api.mellow.finance';

export const ETH_VAULT_ROUTES = [
  {
    path: ETH_DEPOSIT_PATH,
    name: 'Deposit',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.earnEthDepositTab,
  },
  {
    path: ETH_WITHDRAW_PATH,
    name: 'Withdraw',
    matomoEvent: MATOMO_EARN_EVENTS_TYPES.earnEthWithdrawalTab,
  },
];

export const ETH_VAULT_BASE_ASSET_DECIMALS = 18;
