import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import invariant from 'tiny-invariant';
import { ClaimFormInputType, ClaimFormValidationContext } from './types';
import { claimFormValidationResolver } from './validation';
import { useClaim } from 'features/withdrawals/hooks';
import { useMaxSelectedCount } from './use-max-selected-count';
import {
  generateDefaultValues,
  useGetDefaultValues,
} from './use-default-values';
import { ClaimFormHelperState, useHelperState } from './use-helper-state';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';

type ClaimFormDataContextValueType = {
  onSubmit: NonNullable<React.ComponentProps<'form'>['onSubmit']>;
} & ClaimFormHelperState;

const claimFormDataContext =
  createContext<ClaimFormDataContextValueType | null>(null);
claimFormDataContext.displayName = 'claimFormDataContext';

export const useClaimFormData = () => {
  const contextData = useContext(claimFormDataContext);
  invariant(contextData);
  return contextData;
};

export const ClaimFormProvider: React.FC = ({ children }) => {
  const { dispatchModalState } = useTransactionModal();
  const { data } = useClaimData();

  const [shouldReset, setShouldReset] = useState<boolean>(false);
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
  const { watch, reset, handleSubmit, setValue, getValues, formState } =
    formObject;
  const helperState = useHelperState(watch, maxSelectedRequestCount);

  const claim = useClaim();
  const onSubmit = useMemo(
    () =>
      handleSubmit(async ({ selectedTokens }) => {
        const success = await claim(selectedTokens);
        if (success) setShouldReset(true);
      }),
    [handleSubmit, claim],
  );

  useEffect(() => {
    dispatchModalState({ type: 'set_on_retry', callback: onSubmit });
  }, [dispatchModalState, onSubmit]);

  const { isSubmitting } = formState;

  // handles reset and data update
  useEffect(() => {
    // no updates while submitting
    if (!data || isSubmitting) return;

    // reset state after submit
    if (shouldReset) {
      reset(generateDefaultValues(data, defaultSelectedRequestCount));
      setShouldReset(false);
      return;
    }

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
    shouldReset,
    reset,
    isSubmitting,
    defaultSelectedRequestCount,
  ]);

  const claimFormDataContextValue = useMemo(() => {
    return {
      onSubmit,
      ...helperState,
    };
  }, [helperState, onSubmit]);

  return (
    <FormProvider {...formObject}>
      <claimFormDataContext.Provider value={claimFormDataContextValue}>
        {useMemo(() => children, [children])}
      </claimFormDataContext.Provider>
    </FormProvider>
  );
};
