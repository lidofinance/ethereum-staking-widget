import invariant from 'tiny-invariant';
import { useMemo, createContext, useContext, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useWstethBySteth } from 'shared/hooks';
import { useWeb3 } from 'reef-knot/web3-react';
import { useWrapTxApprove } from '../wrap-form/hooks/use-wrap-tx-approve';

import {
  WrapFormDataContextValueType,
  WrapFormInputType,
  WrapFormNetworkData,
} from './types';
import { useWrapFormNetworkData } from './use-wrap-form-network-data';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { useWrapFormProcessor } from '../wrap-form/hooks/use-wrap-form-processing';
import { WrapFormValidationResolver } from './wrap-form-validators';
import { TOKENS_TO_WRAP } from 'features/wrap/types';
import { Zero } from '@ethersproject/constants';
import { computeWrapFormContextValues } from './compute-wrap-form-context-values';

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
export const WrapFormProvider: React.FC = ({ children }) => {
  const { active } = useWeb3();
  const { networkData, networkDataPromise } = useWrapFormNetworkData();

  const formObject = useForm<WrapFormInputType, Promise<WrapFormNetworkData>>({
    defaultValues: {
      amount: null,
      token: TOKENS_TO_WRAP.STETH,
    },
    context: networkDataPromise,
    criteriaMode: 'firstError',
    mode: 'onChange',
    resolver: WrapFormValidationResolver,
  });

  const { handleSubmit, reset, watch } = formObject;
  const [token, amount] = watch(['token', 'amount']);
  const { revalidateWrapFormData } = networkData;

  const approvalData = useWrapTxApprove({ amount: amount ?? Zero, token });
  const processWrapFormFlow = useWrapFormProcessor({
    approvalData,
    onBeforeSuccess: revalidateWrapFormData,
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(async ({ token, amount }) => {
        const success = await processWrapFormFlow({ token, amount });
        if (success) reset();
      }),
    [handleSubmit, processWrapFormFlow, reset],
  );

  const { dispatchModalState } = useTransactionModal();

  useEffect(() => {
    dispatchModalState({ type: 'set_on_retry', callback: onSubmit });
  }, [dispatchModalState, onSubmit]);

  // Reset form amount after disconnect wallet
  useEffect(() => {
    if (!active) reset();
  }, [active, reset]);

  const willReceiveWsteth = useWstethBySteth(
    token === TOKENS_TO_WRAP.STETH && approvalData.isApprovalNeededBeforeWrap
      ? Zero
      : amount ?? Zero,
  );

  const value = useMemo(
    (): WrapFormDataContextValueType => ({
      ...networkData,
      ...approvalData,
      ...computeWrapFormContextValues({
        networkData,
        token,
      }),
      willReceiveWsteth,
      onSubmit,
    }),
    [networkData, approvalData, token, willReceiveWsteth, onSubmit],
  );

  return (
    <FormProvider {...formObject}>
      <WrapFormDataContext.Provider value={value}>
        {children}
      </WrapFormDataContext.Provider>
    </FormProvider>
  );
};
