import { STAKE_TOKENS_OUT } from './consts';
import type {
  StakeFormInputValues,
  StakeTokenOut,
  StakeTokenOutValue,
} from './types';

const isSameTokenOut = (a: StakeTokenOutValue, b: StakeTokenOutValue) =>
  a.token === b.token && a.chainId === b.chainId;

export const isStakeTokenOut = (token: string): token is StakeTokenOut =>
  (STAKE_TOKENS_OUT as readonly string[]).includes(token);

/**
 * What staking `tokenIn` can give: the stake-out tokens available on its
 * chain, stETH first.
 */
export const getTokenOutList = (
  tokenIn: StakeFormInputValues['tokenIn'],
  available: readonly StakeTokenOutValue[],
): StakeTokenOutValue[] =>
  STAKE_TOKENS_OUT.flatMap((token) => {
    const tokenOut = { token, chainId: tokenIn.chainId };
    return available.some((token) => isSameTokenOut(token, tokenOut))
      ? [tokenOut]
      : [];
  });

/**
 * `tokenOut` itself (same object) when the list has it, otherwise the first
 * of the list. An empty list has nothing better to offer: `tokenOut` stays.
 */
export const adjustTokenOut = (
  tokenOut: StakeTokenOutValue,
  tokenOutList: readonly StakeTokenOutValue[],
): StakeTokenOutValue =>
  tokenOutList.some((token) => isSameTokenOut(token, tokenOut))
    ? tokenOut
    : (tokenOutList[0] ?? tokenOut);
