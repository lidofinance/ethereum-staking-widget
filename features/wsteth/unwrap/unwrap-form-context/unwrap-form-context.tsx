import invariant from 'tiny-invariant';
import { useMemo, createContext, useContext } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useStethByWsteth } from 'shared/hooks';

import {
  UnwrapFormDataContextValueType,
  UnwrapFormInputType,
  UnwrapFormNetworkData,
} from './types';
import { useUnwrapFormNetworkData } from '../hooks/use-unwrap-form-network-data';
import { useUnwrapFormProcessor } from '../hooks/use-unwrap-form-processing';
import { UnwrapFormValidationResolver } from './unwrap-form-validators';
import { Zero } from '@ethersproject/constants';

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
export const UnwrapFormProvider: React.FC = ({ children }) => {
  const { networkData, networkDataPromise } = useUnwrapFormNetworkData();

  const formObject = useForm<
    UnwrapFormInputType,
    Promise<UnwrapFormNetworkData>
  >({
    defaultValues: {
      amount: null,
    },
    context: networkDataPromise,
    criteriaMode: 'firstError',
    mode: 'onChange',
    resolver: UnwrapFormValidationResolver,
  });

  const { watch } = formObject;
  const [amount] = watch(['amount']);

  const processUnwrapFormFlow = useUnwrapFormProcessor({
    onConfirm: networkData.revalidateUnwrapFormData,
  });

  const willReceiveStETH = useStethByWsteth(amount ?? Zero);

  const value = useMemo(
    (): UnwrapFormDataContextValueType => ({
      ...networkData,
      willReceiveStETH,
      onSubmit: processUnwrapFormFlow,
    }),
    [networkData, processUnwrapFormFlow, willReceiveStETH],
  );

  return (
    <FormProvider {...formObject}>
      <UnwrapFormDataContext.Provider value={value}>
        {children}
      </UnwrapFormDataContext.Provider>
    </FormProvider>
  );
};
