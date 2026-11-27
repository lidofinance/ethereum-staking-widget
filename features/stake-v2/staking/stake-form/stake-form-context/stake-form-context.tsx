import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type FC,
  type PropsWithChildren,
} from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { FormControllerProvider } from 'shared/hook-form/form-controller';
import {
  useQueryParamsAmountForm,
  useQueryParamsReferralForm,
} from 'shared/hooks/use-query-values-form';

import {
  useFormRouting,
  useLatestResolver,
  useRevalidateOnChange,
  useRoutedFormController,
} from '../../../utils';
import { stakeRouting, type StakeRouteSpec } from '../stake-routes';

import {
  getStakeDefaultValues,
  useKeepTokenOutRoutable,
  useQueryParamsTokenPairForm,
  useStakeRouteState,
  useTokenInFollowsChain,
} from './form-features';
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

/**
 * Stake form state. Unlike the other forms:
 * - it spans every supported chain at once: tokens carry their own
 *   `chainId` instead of following the dapp/wallet chain;
 * - the token pair picks a route (../stake-routes), which brings what
 *   differs per flow: data, validation, max amount, quote, submit;
 * - it validates with a zod schema, which also defines its types.
 */
export const StakeFormContext: FC<PropsWithChildren> = ({ children }) => {
  // the routes: which flow a pair takes, its data, quote and submit
  const routing = useFormRouting(stakeRouting);
  // what tokenIn can stake into, across the supported chains
  const tokensOut = useStakingTokenOutList();

  const form = useForm<
    StakeFormInputValues,
    StakeFormValidationContext,
    StakeFormValidatedInputValues
  >({
    defaultValues: getStakeDefaultValues(tokensOut),
    context: useMemo(() => ({ tokensOut, routing }), [tokensOut, routing]),
    // a superseded validation takes the latest result
    resolver: useLatestResolver(stakeFormResolver),
    mode: 'onChange',
  });

  useKeepTokenOutRoutable(form, tokensOut);
  useTokenInFollowsChain(form);
  // route errors sit on amount but depend on the pair
  useRevalidateOnChange({
    form,
    sources: ['tokenIn', 'tokenOut'],
    targets: ['amount'],
  });
  useQueryParamsTokenPairForm(form, tokensOut);
  useQueryParamsReferralForm(form);
  useQueryParamsAmountForm(form);

  const routeState = useStakeRouteState(form, routing);
  const controller = useRoutedFormController<
    StakeRouteSpec,
    StakeFormInputValues,
    StakeFormValidatedInputValues
  >({
    routing,
    // a new stake: clear the amount, keep the picks
    onReset: useCallback(
      (values: StakeFormInputValues) => form.reset({ ...values, amount: null }),
      [form],
    ),
  });

  return (
    <FormProvider {...form}>
      <StakeFormDataContext.Provider value={routeState}>
        <FormControllerProvider value={controller}>
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
