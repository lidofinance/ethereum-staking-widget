import React, { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { FormControllerContext } from 'shared/hook-form/form-controller';

const noopSubscribe = function noopSubscribe() {
  return () => {};
};

export const STGDepositFormProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const formObject = useForm({
    defaultValues: { amount: null, token: 'ETH' },
    mode: 'onChange',
  });

  const formControllerValue = useMemo(
    () => ({
      onSubmit: async () => {
        return true;
      },
      onReset: () => {},
      retryEvent: { subscribe: noopSubscribe },
    }),
    [],
  );

  return (
    <FormProvider {...formObject}>
      <FormControllerContext.Provider value={formControllerValue as any}>
        {children}
      </FormControllerContext.Provider>
    </FormProvider>
  );
};

export default STGDepositFormProvider;
