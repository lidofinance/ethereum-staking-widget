import { TOKENS } from '@lido-sdk/constants';

export const TOKEN_DISPLAY_NAMES = {
  ETH: 'ETH',
  [TOKENS.STETH]: 'stETH',
  [TOKENS.WSTETH]: 'wstETH',
};

export const getTokenDisplayName = (token: keyof typeof TOKEN_DISPLAY_NAMES) =>
  TOKEN_DISPLAY_NAMES[token];
