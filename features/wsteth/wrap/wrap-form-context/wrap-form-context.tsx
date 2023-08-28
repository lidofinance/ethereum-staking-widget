import invariant from 'tiny-invariant';
import { useMemo, createContext, useContext } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useWstethBySteth } from 'shared/hooks';
import { useWrapTxApprove } from '../hooks/use-wrap-tx-approve';
import { useWrapFormNetworkData } from '../hooks/use-wrap-form-network-data';
import { useWrapFormProcessor } from '../hooks/use-wrap-form-processing';

import { FormControllerContext } from 'features/wsteth/shared/form-controller/form-controller-context';

import {
  WrapFormDataContextValueType,
  WrapFormInputType,
  WrapFormNetworkData,
} from './types';
import { WrapFormValidationResolver } from './wrap-form-validators';
import { TOKENS_TO_WRAP } from 'features/wsteth/shared/types';
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

  const { watch } = formObject;
  const [token, amount] = watch(['token', 'amount']);

  const approvalData = useWrapTxApprove({ amount: amount ?? Zero, token });
  const processWrapFormFlow = useWrapFormProcessor({
    approvalData,
    onConfirm: networkData.revalidateWrapFormData,
  });

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
      onSubmit: processWrapFormFlow,
    }),
    [networkData, approvalData, token, willReceiveWsteth, processWrapFormFlow],
  );

  return (
    <FormProvider {...formObject}>
      <WrapFormDataContext.Provider value={value}>
        <FormControllerContext.Provider value={value}>
          {children}
        </FormControllerContext.Provider>
      </WrapFormDataContext.Provider>
    </FormProvider>
  );
};
