import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export const TOKEN_DISPLAY_NAMES = {
  [LIDO_TOKENS.eth]: 'ETH',
  [LIDO_TOKENS.steth]: 'stETH',
  [LIDO_TOKENS.wsteth]: 'wstETH',
};

export type TOKEN_DISPLAY_NAMES_TYPE = keyof typeof TOKEN_DISPLAY_NAMES;

export const getTokenDisplayName = (token: TOKEN_DISPLAY_NAMES_TYPE) =>
  TOKEN_DISPLAY_NAMES[token];
