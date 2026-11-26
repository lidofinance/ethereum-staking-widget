import { STAKE_TOKENS_IN } from './consts';
import type { StakeFormInputValues, StakeTokenIn } from './types';

export const isStakeTokenIn = (token: string): token is StakeTokenIn =>
  (STAKE_TOKENS_IN as readonly string[]).includes(token);

/**
 * The first stake-in token of `tokenInList` on `chainId`, in list order;
 * undefined when the chain has none.
 */
export const getFirstTokenInOnChain = (
  tokenInList: readonly { token: string; chainId: number }[],
  chainId: number,
): StakeFormInputValues['tokenIn'] | undefined => {
  const first = tokenInList.find(
    (item) => item.chainId === chainId && isStakeTokenIn(item.token),
  );
  return first && isStakeTokenIn(first.token)
    ? { token: first.token, chainId }
    : undefined;
};
