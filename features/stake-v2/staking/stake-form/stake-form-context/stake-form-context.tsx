import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type FC,
  type PropsWithChildren,
} from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import invariant from 'tiny-invariant';

import { config } from 'config';
import { TOKENS } from 'consts/tokens';
import { useDappStatus, useTokenList } from 'modules/web3';
import {
  FormControllerProvider,
  useFormControllerRetry,
  type FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import {
  useQueryParamsAmountForm,
  useQueryParamsReferralForm,
} from 'shared/hooks/use-query-values-form';

import { getFirstTokenInOnChain } from './token-in';
import { adjustTokenOut, getTokenOutList } from './token-out';
import type {
  StakeFormDataContextValue,
  StakeFormInputValues,
  StakeFormValidatedInputValues,
  StakeFormValidationContext,
} from './types';
import { useStakingTokenOutList } from './use-staking-token-out-list';
import { stakeFormResolver } from './validation';

const StakeFormDataContext = createContext<StakeFormDataContextValue | null>(
  null,
);
StakeFormDataContext.displayName = 'StakeFormDataContext';

/** auxiliary form data, alongside the hook-form state */
export const useStakeForm = () => {
  const value = useContext(StakeFormDataContext);
  invariant(value, 'useStakeForm was used outside the StakeFormContext');
  return value;
};

const DEFAULT_TOKEN_IN: StakeFormInputValues['tokenIn'] = {
  token: TOKENS.eth,
  chainId: config.defaultChain,
};

/**
 * Stake form state. Unlike the other forms:
 * - it spans every supported chain at once: tokens carry their own
 *   `chainId` instead of following the dapp/wallet chain, so tx and
 *   validation must read the chain from the values;
 * - it validates with a zod schema (validation.ts), which also defines
 *   the input and validated value types.
 * `tokenOut` must be one `tokenIn` can stake into (adjustTokenOut): fixed
 * in the default values, after every `tokenIn` change, and first thing in
 * the resolver, so a stale pair never reaches submit.
 * Tx and the remaining validation are still to come.
 */
export const StakeFormContext: FC<PropsWithChildren> = ({ children }) => {
  const tokensOut = useStakingTokenOutList();
  const validationContext = useMemo(
    (): StakeFormValidationContext => ({ tokensOut }),
    [tokensOut],
  );

  const formObject = useForm<
    StakeFormInputValues,
    StakeFormValidationContext,
    StakeFormValidatedInputValues
  >({
    defaultValues: {
      amount: null,
      tokenIn: DEFAULT_TOKEN_IN,
      tokenOut: adjustTokenOut(
        { token: TOKENS.steth, chainId: config.defaultChain },
        getTokenOutList(DEFAULT_TOKEN_IN, tokensOut),
      ),
      referral: null,
    },
    context: validationContext,
    resolver: stakeFormResolver,
    mode: 'onChange',
  });
  const { control, getValues, setValue } = formObject;
  useQueryParamsReferralForm<StakeFormInputValues>({ setValue });
  useQueryParamsAmountForm<StakeFormInputValues>({ setValue });

  // the UI follows tokenIn: a tokenOut it cannot stake into is replaced
  const tokenIn = useWatch({ control, name: 'tokenIn' });
  useEffect(() => {
    const tokenOut = getValues('tokenOut');
    const adjusted = adjustTokenOut(
      tokenOut,
      getTokenOutList(tokenIn, tokensOut),
    );
    if (adjusted !== tokenOut) {
      setValue('tokenOut', adjusted, { shouldValidate: true });
    }
  }, [tokenIn, tokensOut, getValues, setValue]);

  // tokenIn follows a chain change (wallet or chain switcher): the first
  // stake-in token on the new chain, if the list has any. It only sets the
  // value and never requests a chain itself: switching chains is left to
  // user actions (TokenInSelect), so the two cannot loop
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

  // every stake-in token is ETH or 1:1 with it (WETH), so the amount is
  // already in ETH. A token that is not ETH-equivalent needs a conversion
  // here, by tokenIn
  const amount = useWatch({ control, name: 'amount' });
  const dataValue = useMemo(
    (): StakeFormDataContextValue => ({ amountInEth: amount }),
    [amount],
  );

  const { retryEvent } = useFormControllerRetry();
  const formControllerValue = useMemo(
    (): FormControllerContextValueType<StakeFormInputValues> => ({
      onSubmit: async () => {
        // stake tx
        return true;
      },
      onReset: ({ tokenIn, tokenOut, referral }) => {
        formObject.reset({ amount: null, tokenIn, tokenOut, referral });
      },
      retryEvent,
      resetFormOn: 'off',
    }),
    [formObject, retryEvent],
  );

  return (
    <FormProvider {...formObject}>
      <StakeFormDataContext.Provider value={dataValue}>
        <FormControllerProvider value={formControllerValue}>
          {children}
        </FormControllerProvider>
      </StakeFormDataContext.Provider>
    </FormProvider>
  );
};

export const useStakeFormContext = () =>
  useFormContext<
    StakeFormInputValues,
    StakeFormValidationContext,
    StakeFormValidatedInputValues
  >();
