import { TOKEN_SYMBOLS } from 'consts/tokens';

export const USD_VAULT_TOKEN_SYMBOL = TOKEN_SYMBOLS.earnusd;

export const USD_VAULT_DEPOSIT_TOKENS = [
  TOKEN_SYMBOLS.usdc,
  TOKEN_SYMBOLS.usdt,
] as const;

export const USD_VAULT_QUERY_SCOPE = 'earn-vault-usd';

export const USD_VAULT_STATS_ORIGIN = 'https://api.mellow.finance';
