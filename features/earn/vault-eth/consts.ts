export const ETH_TOKEN_SYMBOL = 'earnETH';

export const ETH_DEPOSABLE_TOKENS_MAIN = ['ETH', 'wETH', 'wstETH'] as const;

// Tokens not available for direct deposit via deposit form,
// but a user can upgrade the whole amount of them via one "upgrade" action
export const ETH_DEPOSABLE_TOKENS_UPGRADABLE = [
  'GG',
  'strETH',
  'DVstETH',
] as const;

export const ETH_DEPOSABLE_TOKENS = [
  ...ETH_DEPOSABLE_TOKENS_MAIN,
  ...ETH_DEPOSABLE_TOKENS_UPGRADABLE,
] as const;
