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
import { useQueryParamsReferralForm } from 'shared/hooks/use-query-values-form';
import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';

import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { useWrapTxOnL1Approve } from '../hooks/use-wrap-tx-on-l1-approve';
import { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import { useWrapFormProcessor } from '../hooks/use-wrap-form-processing';
import { useWrapFormValidationContext } from '../hooks/use-wrap-form-validation-context';

import {
  WrapFormDataContextValueType,
  WrapFormInputType,
  WrapFormValidationContext,
} from './types';
import { WrapFormValidationResolver } from './wrap-form-validators';

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
      token: TOKENS_TO_WRAP.stETH,
      referral: null,
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
    setValue,
  } = formObject;
  useQueryParamsReferralForm<WrapFormInputType>({ setValue });
  const [token, amount] = watch(['token', 'amount']);
  const { retryEvent, retryFire } = useFormControllerRetry();

  const approvalDataOnL1 = useWrapTxOnL1Approve({
    amount: amount ?? 0n,
    token,
  });
  const isSteth = token === TOKENS_TO_WRAP.stETH;

  const onConfirm = useCallback(async () => {
    await Promise.allSettled([
      networkData.revalidateWrapFormData(),
      approvalDataOnL1.refetchAllowance(),
    ]);
  }, [networkData, approvalDataOnL1]);

  const processWrapFormFlow = useWrapFormProcessor({
    approvalDataOnL1,
    onConfirm,
    onRetry: retryFire,
  });

  const onSubmit = useCallback(
    async (args: WrapFormInputType) => {
      trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.wrapStart);
      const wrapResult = await processWrapFormFlow(args);
      if (wrapResult) {
        trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.wrapFinish);
      }
      return wrapResult;
    },
    [processWrapFormFlow],
  );

  const value = useMemo(
    (): WrapFormDataContextValueType => ({
      ...networkData,
      ...approvalDataOnL1,
      isSteth,
      stakeLimitInfo: networkData.stakeLimitInfo,
      maxAmount: isSteth ? networkData.stethBalance : networkData.maxAmountETH,
      wrapGasLimit: isSteth
        ? networkData.gasLimitStETH
        : networkData.gasLimitETH,
    }),
    [networkData, approvalDataOnL1, isSteth],
  );

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<WrapFormInputType> => ({
      onSubmit,
      onReset: ({ token }: WrapFormInputType) => {
        reset({
          ...defaultValues,
          token,
        });
      },
      retryEvent,
    }),
    [onSubmit, retryEvent, reset, defaultValues],
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
