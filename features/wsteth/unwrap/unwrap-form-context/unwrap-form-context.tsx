import invariant from 'tiny-invariant';
import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';

import { useUnwrapFormNetworkData } from '../hooks/use-unwrap-form-network-data';
import { useUnwrapFormProcessor } from '../hooks/use-unwrap-form-processing';
import { useUnwrapFormValidationContext } from '../hooks/use-unwra-form-validation-context';
import { useUnwrapTxOnL2Approve } from '../hooks/use-unwrap-tx-on-l2-approve';

import {
  UnwrapFormDataContextValueType,
  UnwrapFormInputType,
  UnwrapFormValidationContext,
} from './types';
import { UnwrapFormValidationResolver } from './unwrap-form-validators';

//
// Data context
//
const UnwrapFormDataContext =
  createContext<UnwrapFormDataContextValueType | null>(null);
UnwrapFormDataContext.displayName = 'UnwrapFormDataContext';

export const useUnwrapFormData = () => {
  const value = useContext(UnwrapFormDataContext);
  invariant(value, 'useUnwrapFormData was used outside the provider');
  return value;
};

//
// Data provider
//
export const UnwrapFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const networkData = useUnwrapFormNetworkData();
  const validationContextPromise = useUnwrapFormValidationContext({
    networkData,
  });

  const formObject = useForm<
    UnwrapFormInputType,
    Promise<UnwrapFormValidationContext>
  >({
    defaultValues: {
      amount: null,
      dummyErrorField: null,
    },
    context: validationContextPromise,
    criteriaMode: 'firstError',
    mode: 'onChange',
    resolver: UnwrapFormValidationResolver,
  });

  const { watch } = formObject;
  const [amount] = watch(['amount']);
  const { retryEvent, retryFire } = useFormControllerRetry();

  const approvalDataOnL2 = useUnwrapTxOnL2Approve({ amount: amount ?? 0n });

  const onConfirm = useCallback(async () => {
    await Promise.allSettled([
      networkData.revalidateUnwrapFormData(),
      approvalDataOnL2.refetchAllowance(),
    ]);
  }, [networkData, approvalDataOnL2]);

  const processUnwrapFormFlow = useUnwrapFormProcessor({
    approvalDataOnL2,
    onConfirm,
    onRetry: retryFire,
  });

  const value = useMemo(
    (): UnwrapFormDataContextValueType => ({
      ...networkData,
      ...approvalDataOnL2,
    }),
    [networkData, approvalDataOnL2],
  );

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<UnwrapFormInputType> => ({
      onSubmit: processUnwrapFormFlow,
      retryEvent,
    }),
    [processUnwrapFormFlow, retryEvent],
  );

  return (
    <FormProvider {...formObject}>
      <UnwrapFormDataContext.Provider value={value}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </UnwrapFormDataContext.Provider>
    </FormProvider>
  );
};
