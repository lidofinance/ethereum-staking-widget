import invariant from 'tiny-invariant';
import { CHAINS, CHAINS_COLORS } from '@lido-sdk/constants';

import { CUSTOM_CHAINS_COLORS } from 'config';

export const getChainColor = (chainId: CHAINS): string => {
  const color = { ...CHAINS_COLORS, ...CUSTOM_CHAINS_COLORS }[chainId];
  invariant(color != null, 'Chain is not supported');
  return color;
};
