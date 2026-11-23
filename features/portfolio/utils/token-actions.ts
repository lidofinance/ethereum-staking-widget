import { TOKENS, type Token } from 'consts/tokens';
import {
  EARN_PATH,
  HOME_PATH,
  SWAP_PATH,
  WITHDRAWALS_REQUEST_PATH,
  WRAP_PATH,
  WRAP_UNWRAP_PATH,
} from 'consts/urls';
import {
  EARN_VAULT_DEPOSIT_SLUG,
  EARN_VAULT_ETH_SLUG,
  EARN_VAULT_USD_SLUG,
  EARN_VAULT_WITHDRAW_SLUG,
} from 'features/earn/consts';

export type TokenAction = {
  label: string;
  href: string;
  // the main call to action, highlighted in the design
  highlight?: boolean;
};

const earnPath = (vaultSlug: string, actionSlug: string) =>
  `${EARN_PATH}/${vaultSlug}/${actionSlug}`;

const SWAP_ACTION: TokenAction = { label: 'Swap', href: SWAP_PATH };
const STAKE_MORE_ACTION: TokenAction = {
  label: 'Stake more',
  href: HOME_PATH,
  highlight: true,
};
const UNSTAKE_ACTION: TokenAction = {
  label: 'Unstake',
  href: WITHDRAWALS_REQUEST_PATH,
};

const TOKEN_ACTIONS: Partial<Record<Token, TokenAction[]>> = {
  [TOKENS.steth]: [
    STAKE_MORE_ACTION,
    UNSTAKE_ACTION,
    { label: 'Wrap', href: WRAP_PATH },
    SWAP_ACTION,
  ],
  [TOKENS.wsteth]: [
    STAKE_MORE_ACTION,
    UNSTAKE_ACTION,
    { label: 'Unwrap', href: WRAP_UNWRAP_PATH },
    SWAP_ACTION,
  ],
  [TOKENS.eth]: [{ label: 'Wrap', href: WRAP_PATH }, SWAP_ACTION],
  [TOKENS.earneth]: [
    {
      label: 'Supply more',
      href: earnPath(EARN_VAULT_ETH_SLUG, EARN_VAULT_DEPOSIT_SLUG),
      highlight: true,
    },
    {
      label: 'Withdraw',
      href: earnPath(EARN_VAULT_ETH_SLUG, EARN_VAULT_WITHDRAW_SLUG),
    },
    SWAP_ACTION,
  ],
  [TOKENS.earnusd]: [
    {
      label: 'Supply more',
      href: earnPath(EARN_VAULT_USD_SLUG, EARN_VAULT_DEPOSIT_SLUG),
      highlight: true,
    },
    {
      label: 'Withdraw',
      href: earnPath(EARN_VAULT_USD_SLUG, EARN_VAULT_WITHDRAW_SLUG),
    },
    SWAP_ACTION,
  ],
  [TOKENS.weth]: [SWAP_ACTION],
  [TOKENS.usdc]: [SWAP_ACTION],
  [TOKENS.usdt]: [SWAP_ACTION],
  [TOKENS.usde]: [SWAP_ACTION],
};

// actions only for verified tokens: a fake token must not get a CTA
export const getTokenActions = (token?: Token): TokenAction[] =>
  (token && TOKEN_ACTIONS[token]) || [];
