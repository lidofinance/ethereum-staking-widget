import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export const TOKEN_DISPLAY_NAMES = {
  [LIDO_TOKENS.eth]: 'ETH',
  [LIDO_TOKENS.steth]: 'stETH',
  [LIDO_TOKENS.wsteth]: 'wstETH',
  [LIDO_TOKENS.unsteth]: 'unstETH',
  ['wETH']: 'wETH',
  ['gg']: 'gg',
  ['dvstETH']: 'DVstETH',
};

export type TOKEN_DISPLAY_NAMES = keyof typeof TOKEN_DISPLAY_NAMES;

export const getTokenDisplayName = (token: TOKEN_DISPLAY_NAMES) =>
  TOKEN_DISPLAY_NAMES[token];
