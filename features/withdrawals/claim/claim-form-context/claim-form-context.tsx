import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import invariant from 'tiny-invariant';
import { ClaimFormInputType, ClaimFormValidationContext } from './types';
import { claimFormValidationResolver } from './validation';
import { useClaim } from 'features/withdrawals/hooks';
import { useMaxSelectedCount } from './use-max-selected-count';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import {
  generateDefaultValues,
  useGetDefaultValues,
} from './use-default-values';
import { ClaimFormHelperState, useHelperState } from './use-helper-state';
import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

type ClaimFormDataContextValueType = ClaimFormHelperState;

const claimFormDataContext =
  createContext<ClaimFormDataContextValueType | null>(null);
claimFormDataContext.displayName = 'claimFormDataContext';

export const useClaimFormData = () => {
  const contextData = useContext(claimFormDataContext);
  invariant(contextData);
  return contextData;
};

export const ClaimFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data } = useClaimData();

  const { maxSelectedRequestCount, defaultSelectedRequestCount } =
    useMaxSelectedCount();
  const { getDefaultValues } = useGetDefaultValues(defaultSelectedRequestCount);

  const formObject = useForm<ClaimFormInputType, ClaimFormValidationContext>({
    defaultValues: getDefaultValues,
    resolver: claimFormValidationResolver,
    context: { maxSelectedRequestCount },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const { watch, reset, setValue, getValues, formState } = formObject;
  const claimFormDataContextValue = useHelperState(
    watch,
    maxSelectedRequestCount,
  );
  const { retryEvent, retryFire } = useFormControllerRetry();

  const claim = useClaim({ onRetry: retryFire });

  const { isSubmitting } = formState;

  // handles reset and data update
  useEffect(() => {
    // no updates while submitting
    if (!data || isSubmitting) return;

    // for regular updates generate new list but keep user input
    const oldValues = getValues('requests');
    const checkedIds = new Set(
      oldValues.filter((req) => req.checked).map((req) => req.token_id),
    );
    const newRequests = generateDefaultValues(
      data,
      defaultSelectedRequestCount,
    ).requests.map((request) => ({
      ...request,
      checked: checkedIds.has(request.token_id),
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
        onSubmit: ({ selectedTokens }) => claim(selectedTokens),
        onReset: () => {
          if (!data) return;
          reset(generateDefaultValues(data, defaultSelectedRequestCount));
        },
        retryEvent,
      }),
      [claim, data, defaultSelectedRequestCount, reset, retryEvent],
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
