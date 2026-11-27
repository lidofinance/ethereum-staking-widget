import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/router';

import { config } from 'config';
import { TOKENS } from 'consts/tokens';
import { useDappStatus, useTokenList } from 'modules/web3';
import { useEthUsd } from 'shared/hooks/use-eth-usd';

import {
  useFormRouteState,
  useNormalizeOnChange,
  type FormRouting,
} from '../../../utils';
import type { StakeRouteSpec } from '../stake-routes';

import { resolveQueryTokenPair } from './query-token-pair';
import { getFirstTokenInOnChain } from './token-in';
import { routableTokenOut } from './token-out';
import type {
  StakeFormDataContextValue,
  StakeFormInputValues,
  StakeFormValidatedInputValues,
  StakeFormValidationContext,
  StakeTokenOutValue,
} from './types';

// Stake form features, one hook each, so the provider reads as a list.
// TODO: lift these into stake-v2/utils as form-agnostic primitives (a
// token pair kept routable, a token following the chain, query params for
// a pair, route state with amount values) so other routed forms reuse them

type StakeForm = UseFormReturn<
  StakeFormInputValues,
  StakeFormValidationContext,
  StakeFormValidatedInputValues
>;

const DEFAULT_TOKEN_IN: StakeFormInputValues['tokenIn'] = {
  token: TOKENS.eth,
  chainId: config.defaultChain,
};

/** ETH in on the default chain, stETH out when it can stake into it */
export const getStakeDefaultValues = (
  tokensOut: readonly StakeTokenOutValue[],
): StakeFormInputValues => ({
  amount: null,
  tokenIn: DEFAULT_TOKEN_IN,
  tokenOut: routableTokenOut(
    {
      tokenIn: DEFAULT_TOKEN_IN,
      tokenOut: { token: TOKENS.steth, chainId: config.defaultChain },
    },
    tokensOut,
  ),
  referral: null,
});

/** tokenOut stays one tokenIn can stake into; the resolver fixes it too */
export const useKeepTokenOutRoutable = (
  form: StakeForm,
  tokensOut: readonly StakeTokenOutValue[],
) => {
  const normalize = useCallback(
    (values: StakeFormInputValues) => routableTokenOut(values, tokensOut),
    [tokensOut],
  );
  useNormalizeOnChange({
    form,
    sources: ['tokenIn'],
    field: 'tokenOut',
    normalize,
  });
};

/**
 * tokenIn follows a chain change (wallet or chain switcher): the first
 * stake-in token on the new chain, if the list has any. It only sets the
 * value and never requests a chain: switching chains is left to user
 * actions (TokenInSelect), so the two cannot loop.
 */
export const useTokenInFollowsChain = ({ getValues, setValue }: StakeForm) => {
  const { chainId } = useDappStatus();
  const { tokens: tokensIn } = useTokenList({ tokenList: 'stakable' });
  // read at the change, so balance re-sorts alone do not rerun this
  const tokensInRef = useRef(tokensIn);
  tokensInRef.current = tokensIn;

  useEffect(() => {
    if (getValues('tokenIn').chainId === chainId) return;
    const first = getFirstTokenInOnChain(tokensInRef.current, chainId);
    if (first) setValue('tokenIn', first, { shouldValidate: true });
  }, [chainId, getValues, setValue]);
};

/** the route state of the current values, for useStakeForm */
export const useStakeRouteState = (
  { control }: StakeForm,
  routing: FormRouting<StakeRouteSpec>,
): StakeFormDataContextValue => {
  const [tokenIn, tokenOut, amount] = useWatch({
    control,
    name: ['tokenIn', 'tokenOut', 'amount'],
  });
  const pair = useMemo(() => ({ tokenIn, tokenOut }), [tokenIn, tokenOut]);
  const routeState = useFormRouteState({ routing, pair, amount });

  // every stake-in token is ETH or 1:1 with it (WETH), so the amount is
  // already in ETH; a token that is not needs a conversion here
  const amountInEth = amount;
  const { usdAmount: amountInUsd } = useEthUsd(amountInEth ?? 0n);

  return useMemo(
    () => ({ ...routeState, amountInEth, amountInUsd }),
    [routeState, amountInEth, amountInUsd],
  );
};

const asParam = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;

/**
 * Applies a `?chain=&tokenIn=&tokenOut=` link once the router is ready
 * (see resolveQueryTokenPair), then drops the params, so a reload keeps the
 * user's own picks. It sets the form only: a chain switch is left to the
 * user, as everywhere.
 */
export const useQueryParamsTokenPairForm = (
  { getValues, setValue }: StakeForm,
  tokensOut: readonly StakeTokenOutValue[],
) => {
  const { isReady, query, pathname, replace } = useRouter();
  const { supportedChainIds } = useDappStatus();
  const { tokens: tokensIn } = useTokenList({ tokenList: 'stakable' });
  const isAppliedRef = useRef(false);

  useEffect(() => {
    if (!isReady || isAppliedRef.current) return;
    isAppliedRef.current = true;

    const { chain, tokenIn, tokenOut, ...rest } = query;
    const params = {
      chain: asParam(chain),
      tokenIn: asParam(tokenIn),
      tokenOut: asParam(tokenOut),
    };
    if (!params.chain && !params.tokenIn && !params.tokenOut) return;

    // shallow: the page data does not change; a cancelled route is no error
    replace({ pathname, query: rest }, undefined, {
      shallow: true,
      scroll: false,
    }).catch(() => {});

    const pair = resolveQueryTokenPair(params, {
      current: {
        tokenIn: getValues('tokenIn'),
        tokenOut: getValues('tokenOut'),
      },
      chainIds: supportedChainIds,
      tokensIn,
      tokensOut,
    });
    setValue('tokenIn', pair.tokenIn, { shouldValidate: true });
    setValue('tokenOut', pair.tokenOut, { shouldValidate: true });
  }, [
    isReady,
    query,
    pathname,
    replace,
    supportedChainIds,
    tokensIn,
    tokensOut,
    getValues,
    setValue,
  ]);
};
