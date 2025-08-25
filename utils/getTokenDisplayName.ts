import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';
import { DVV_TOKEN_SYMBOL } from 'features/earn/vault-dvv/consts';
import { GGV_TOKEN_SYMBOL } from 'features/earn/vault-ggv/consts';

export const TOKEN_DISPLAY_NAMES = {
  [LIDO_TOKENS.eth]: 'ETH',
  [LIDO_TOKENS.steth]: 'stETH',
  [LIDO_TOKENS.wsteth]: 'wstETH',
  [LIDO_TOKENS.unsteth]: 'unstETH',
  ['wETH']: 'wETH',
  ['gg']: GGV_TOKEN_SYMBOL,
  ['dvstETH']: DVV_TOKEN_SYMBOL,
};

export type TOKEN_DISPLAY_NAMES = keyof typeof TOKEN_DISPLAY_NAMES;

export const getTokenDisplayName = (token: TOKEN_DISPLAY_NAMES) =>
  TOKEN_DISPLAY_NAMES[token];
