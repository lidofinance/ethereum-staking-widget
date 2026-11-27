import { isSameTokenOnChain, type TokenOnChain } from '../../../utils';

import { isStakeTokenIn } from './token-in';
import { getTokenOutList } from './token-out';
import type { StakeFormInputValues, StakeTokenOutValue } from './types';

export type QueryTokenPairParams = {
  chain?: string;
  tokenIn?: string;
  tokenOut?: string;
};

type TokenPair = Pick<StakeFormInputValues, 'tokenIn' | 'tokenOut'>;

type ResolveQueryTokenPairArgs = {
  /** the pair before the query applies */
  current: TokenPair;
  /** supported chains, in order: the first is the fallback */
  chainIds: readonly number[];
  /** what can be staked, on every supported chain, in order */
  tokensIn: readonly TokenOnChain[];
  /** what staking can give, on every supported chain */
  tokensOut: readonly StakeTokenOutValue[];
};

/**
 * The pair a `?chain=&tokenIn=&tokenOut=` link asks for, fixed step by step
 * and silently: an invalid choice drops to the first valid one.
 * 1. chain: the param when supported, else the first supported chain;
 *    without the param, the current tokenIn's chain;
 * 2. tokenIn: the param when it can be staked on that chain, else the
 *    chain's first stake-in token; without the param, the current token
 *    when the chain has it;
 * 3. tokenOut: the param when tokenIn stakes into it, else the first
 *    option; without the param, the current one when it is an option.
 * Token params are token ids (`eth`, `wsteth`), any case.
 */
export const resolveQueryTokenPair = (
  params: QueryTokenPairParams,
  { current, chainIds, tokensIn, tokensOut }: ResolveQueryTokenPairArgs,
): TokenPair => {
  const chainParam = params.chain === undefined ? null : Number(params.chain);
  const chainId =
    chainParam === null
      ? current.tokenIn.chainId
      : chainIds.includes(chainParam)
        ? chainParam
        : (chainIds[0] ?? current.tokenIn.chainId);

  const tokensInOnChain = tokensIn.filter(
    (item) => item.chainId === chainId && isStakeTokenIn(item.token),
  );
  const pickIn = (token?: string) =>
    token === undefined
      ? undefined
      : tokensInOnChain.find((item) => item.token === token.toLowerCase());
  // a tokenIn the link names but the chain lacks drops to the first one;
  // without one, the current token stays when the chain has it
  const tokenInItem =
    (params.tokenIn === undefined
      ? pickIn(current.tokenIn.token)
      : pickIn(params.tokenIn)) ?? tokensInOnChain[0];
  const tokenIn =
    tokenInItem && isStakeTokenIn(tokenInItem.token)
      ? { token: tokenInItem.token, chainId }
      : current.tokenIn;

  const options = getTokenOutList(tokenIn, tokensOut);
  // likewise: a named tokenOut must be an option, else the first one
  const tokenOut =
    (params.tokenOut === undefined
      ? options.find((option) => isSameTokenOnChain(option, current.tokenOut))
      : options.find(
          (option) => option.token === params.tokenOut?.toLowerCase(),
        )) ??
    options[0] ??
    current.tokenOut;

  return { tokenIn, tokenOut };
};
