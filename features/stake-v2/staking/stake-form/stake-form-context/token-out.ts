import { isOneOf, keepOrFirst } from '../../../utils';
import { isRoutable } from '../stake-routes';

import { STAKE_TOKENS_OUT } from './consts';
import type { StakeFormInputValues, StakeTokenOutValue } from './types';

export const isStakeTokenOut = isOneOf(STAKE_TOKENS_OUT);

const tokenOutOrder = ({ token }: StakeTokenOutValue) =>
  STAKE_TOKENS_OUT.indexOf(token);

/**
 * What staking `tokenIn` can give: the available tokens some stake route
 * leads to from it, stETH first.
 */
export const getTokenOutList = (
  tokenIn: StakeFormInputValues['tokenIn'],
  available: readonly StakeTokenOutValue[],
): StakeTokenOutValue[] =>
  available
    .filter((tokenOut) => isRoutable({ tokenIn, tokenOut }))
    .sort((a, b) => tokenOutOrder(a) - tokenOutOrder(b));

/** tokenOut when tokenIn can still stake into it, else the first option */
export const adjustTokenOut = (
  tokenOut: StakeTokenOutValue,
  tokenOutList: readonly StakeTokenOutValue[],
) => keepOrFirst(tokenOut, tokenOutList);

/** tokenOut of `values`, fixed to one their tokenIn can stake into */
export const routableTokenOut = (
  { tokenIn, tokenOut }: Pick<StakeFormInputValues, 'tokenIn' | 'tokenOut'>,
  tokensOut: readonly StakeTokenOutValue[],
) => adjustTokenOut(tokenOut, getTokenOutList(tokenIn, tokensOut));
