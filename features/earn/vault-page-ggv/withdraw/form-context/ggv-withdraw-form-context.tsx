import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';

const GGVWithdrawFormDataContext = createContext(null);

export const GGVWithdrawFormProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const formObject = useForm<any>();
  const { retryEvent } = useFormControllerRetry();

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<any> => ({
      onSubmit: async () => false,
      retryEvent,
    }),
    [retryEvent],
  );

  return (
    <FormProvider {...formObject}>
      <GGVWithdrawFormDataContext.Provider value={null}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </GGVWithdrawFormDataContext.Provider>
    </FormProvider>
  );
};
