import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { DVV_TOKEN_SYMBOL } from 'features/earn/vault-dvv/consts';
import { GGV_TOKEN_SYMBOL } from 'features/earn/vault-ggv/consts';
import { STG_TOKEN_SYMBOL } from 'features/earn/vault-stg/consts';

// TODO: use TOKEN_SYMBOLS instead of TOKEN_DISPLAY_NAMES
// see /consts/tokens.ts for more details
export const TOKEN_DISPLAY_NAMES = {
  [LIDO_TOKENS.eth]: 'ETH',
  [LIDO_TOKENS.steth]: 'stETH',
  [LIDO_TOKENS.wsteth]: 'wstETH',
  [LIDO_TOKENS.unsteth]: 'unstETH',
  ['wETH']: 'WETH',
  ['gg']: GGV_TOKEN_SYMBOL,
  ['GG']: GGV_TOKEN_SYMBOL,
  ['dvstETH']: DVV_TOKEN_SYMBOL,
  ['DVstETH']: DVV_TOKEN_SYMBOL,
  ['strETH']: STG_TOKEN_SYMBOL,
  [TOKEN_SYMBOLS.earneth]: TOKEN_SYMBOLS.earneth,
  [TOKEN_SYMBOLS.earnusd]: TOKEN_SYMBOLS.earnusd,
  [TOKEN_SYMBOLS.usdc]: TOKEN_SYMBOLS.usdc,
  [TOKEN_SYMBOLS.usdt]: TOKEN_SYMBOLS.usdt,
} as const;

export type TOKEN_DISPLAY_NAMES = keyof typeof TOKEN_DISPLAY_NAMES;

// TODO: use getTokenSymbol instead of getTokenDisplayName
// see /consts/tokens.ts for more details
export const getTokenDisplayName = (token: TOKEN_DISPLAY_NAMES) =>
  TOKEN_DISPLAY_NAMES[token];
