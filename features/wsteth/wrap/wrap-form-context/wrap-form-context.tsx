import invariant from 'tiny-invariant';
import {
  FC,
  PropsWithChildren,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useDebouncedValue, useWstethBySteth } from 'shared/hooks';
import { useWrapTxApprove } from '../hooks/use-wrap-tx-approve';
import { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import { useWrapFormProcessor } from '../hooks/use-wrap-form-processing';
import { useWrapFormValidationContext } from '../hooks/use-wrap-form-validation-context';
import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';

import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';

import {
  WrapFormDataContextValueType,
  WrapFormInputType,
  WrapFormValidationContext,
} from './types';
import { WrapFormValidationResolver } from './wrap-form-validators';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
import { Zero } from '@ethersproject/constants';

//
// Data context
//
const WrapFormDataContext = createContext<WrapFormDataContextValueType | null>(
  null,
);
WrapFormDataContext.displayName = 'WrapFormDataContext';

export const useWrapFormData = () => {
  const value = useContext(WrapFormDataContext);
  invariant(value, 'useWrapFormData was used outside the provider');
  return value;
};

//
// Data provider
//
export const WrapFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const networkData = useWrapFormNetworkData();
  const validationContextPromise = useWrapFormValidationContext({
    networkData,
  });

  const formObject = useForm<WrapFormInputType, WrapFormValidationContext>({
    defaultValues: {
      amount: null,
      token: TOKENS_TO_WRAP.STETH,
    },
    context: validationContextPromise,
    criteriaMode: 'firstError',
    mode: 'onChange',
    resolver: WrapFormValidationResolver,
  });

  const {
    watch,
    reset,
    formState: { defaultValues },
  } = formObject;
  const [token, amount] = watch(['token', 'amount']);
  const { retryEvent, retryFire } = useFormControllerRetry();

  const approvalData = useWrapTxApprove({ amount: amount ?? Zero, token });
  const isSteth = token === TOKENS_TO_WRAP.STETH;
  const amountDebounced = useDebouncedValue(amount, 500);
  const willReceiveWsteth = useWstethBySteth(amountDebounced ?? Zero);

  const processWrapFormFlow = useWrapFormProcessor({
    approvalData,
    onConfirm: networkData.revalidateWrapFormData,
    onRetry: retryFire,
  });

  const value = useMemo(
    (): WrapFormDataContextValueType => ({
      ...networkData,
      ...approvalData,
      isSteth,
      stakeLimitInfo: networkData.stakeLimitInfo,
      maxAmount: isSteth ? networkData.stethBalance : networkData.maxAmountETH,
      wrapGasLimit: isSteth
        ? networkData.gasLimitStETH
        : networkData.gasLimitETH,
      willReceiveWsteth,
    }),
    [networkData, approvalData, isSteth, willReceiveWsteth],
  );

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<WrapFormInputType> => ({
      onSubmit: processWrapFormFlow,
      onReset: ({ token }: WrapFormInputType) => {
        reset({
          ...defaultValues,
          token,
        });
      },
      retryEvent,
    }),
    [processWrapFormFlow, retryEvent, reset, defaultValues],
  );

  return (
    <FormProvider {...formObject}>
      <WrapFormDataContext.Provider value={value}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </WrapFormDataContext.Provider>
    </FormProvider>
  );
};
