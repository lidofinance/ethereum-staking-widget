import { TOKEN_SYMBOLS, TOKENS } from 'consts/tokens';

export const USD_VAULT_TITLE = 'EarnUSD';
export const USD_VAULT_DESCRIPTION =
  'EarnUSD delivers access to USD-denominated reward strategies built around transparent asset selection, risk controls and reporting';

export const USD_VAULT_TOKEN_SYMBOL = TOKEN_SYMBOLS.earnusd;

const { usdt, usdc } = TOKEN_SYMBOLS;
export const USD_VAULT_DEPOSIT_TOKEN_SYMBOLS = {
  usdt,
  usdc,
} as const;

export const USD_VAULT_DEPOSIT_TOKENS = [TOKENS.usdc, TOKENS.usdt] as const;

export const USD_VAULT_QUERY_SCOPE = 'earn-vault-usd';

export const USD_VAULT_STATS_ORIGIN = 'https://api.mellow.finance';

export const USD_VAULT_BASE_ASSET_DECIMALS = 6;
