import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';

import { useClaim } from 'features/withdrawals/hooks';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useDappStatus } from 'modules/web3';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { ClaimFormInputType, ClaimFormValidationContext } from './types';
import { claimFormValidationResolver } from './validation';
import { useMaxSelectedCount } from './use-max-selected-count';
import {
  generateDefaultValues,
  useGetDefaultValues,
} from './use-default-values';
import { ClaimFormHelperState, useHelperState } from './use-helper-state';

type ClaimFormDataContextValueType = ClaimFormHelperState & {
  maxSelectedCountReason: string | null;
};

const claimFormDataContext =
  createContext<ClaimFormDataContextValueType | null>(null);
claimFormDataContext.displayName = 'claimFormDataContext';

export const useClaimFormData = () => {
  const contextData = useContext(claimFormDataContext);
  invariant(contextData);
  return contextData;
};

export const ClaimFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isDappActive } = useDappStatus();
  const { data } = useClaimData();

  const {
    maxSelectedRequestCount,
    defaultSelectedRequestCount,
    maxSelectedCountReason,
  } = useMaxSelectedCount();
  const { getDefaultValues } = useGetDefaultValues(defaultSelectedRequestCount);

  const formObject = useForm<ClaimFormInputType, ClaimFormValidationContext>({
    defaultValues: getDefaultValues,
    resolver: claimFormValidationResolver,
    context: { maxSelectedRequestCount, isWalletActive: isDappActive },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const { watch, reset, setValue, getValues, formState } = formObject;

  const helperState = useHelperState(watch, maxSelectedRequestCount);

  const claimFormDataContextValue = useMemo(
    () => ({ ...helperState, maxSelectedCountReason }),
    [helperState, maxSelectedCountReason],
  );

  const { retryEvent, retryFire } = useFormControllerRetry();

  const claim = useClaim({ onRetry: retryFire });

  const onSubmit = useCallback(
    async ({ selectedTokens }: ClaimFormInputType) => {
      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalClaimStart);
      const claimResult = await claim(selectedTokens);
      if (claimResult) {
        trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalClaimFinish);
      }
      return claimResult;
    },
    [claim],
  );

  const { isSubmitting } = formState;

  // handles reset and data update
  useEffect(() => {
    // no updates while submitting
    if (!data || isSubmitting) return;

    // for regular updates generate new list but keep user input
    const prevCheckState = (getValues('requests') || []).reduce(
      (res, req) => ({
        ...res,
        [req.token_id]: req.checked,
      }),
      {} as Record<string, boolean>,
    );

    const newRequests = generateDefaultValues(
      data,
      defaultSelectedRequestCount,
    ).requests.map((request) => ({
      ...request,
      checked:
        prevCheckState[request.token_id] !== undefined
          ? prevCheckState[request.token_id]
          : request.status.isFinalized,
    }));

    setValue('requests', newRequests, {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [
    data,
    getValues,
    setValue,
    reset,
    isSubmitting,
    defaultSelectedRequestCount,
  ]);

  const formControllerValue: FormControllerContextValueType<ClaimFormInputType> =
    useMemo(
      () => ({
        onSubmit,
        onReset: () => {
          if (!data) return;
          reset(generateDefaultValues(data, defaultSelectedRequestCount));
        },
        retryEvent,
      }),
      [data, defaultSelectedRequestCount, onSubmit, reset, retryEvent],
    );

  return (
    <FormProvider {...formObject}>
      <claimFormDataContext.Provider value={claimFormDataContextValue}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </claimFormDataContext.Provider>
    </FormProvider>
  );
};
