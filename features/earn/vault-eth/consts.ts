import { TOKEN_SYMBOLS } from 'consts/tokens';

export const ETH_VAULT_TOKEN_SYMBOL = TOKEN_SYMBOLS.earneth;

export const ETH_VAULT_DEPOSIT_TOKENS_MAIN = [
  TOKEN_SYMBOLS.eth,
  TOKEN_SYMBOLS.weth,
  TOKEN_SYMBOLS.wsteth,
] as const;

// Tokens not available for direct deposit via deposit form,
// but a user can upgrade the whole amount of them via one "upgrade" action
export const ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE = [
  TOKEN_SYMBOLS.gg,
  TOKEN_SYMBOLS.streth,
  TOKEN_SYMBOLS.dvsteth,
] as const;

export const ETH_VAULT_DEPOSIT_TOKENS = [
  ...ETH_VAULT_DEPOSIT_TOKENS_MAIN,
  ...ETH_VAULT_DEPOSIT_TOKENS_UPGRADABLE,
] as const;

export const ETH_VAULT_QUERY_SCOPE = 'earn-vault-eth';

export const ETH_VAULT_STATS_ORIGIN = 'https://api.mellow.finance';
