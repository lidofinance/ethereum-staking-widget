import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';
import { createContext, FC, PropsWithChildren, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { useFormControllerRetry } from 'shared/hook-form/form-controller/use-form-controller-retry-delegate';
import {
  FormControllerContext,
  FormControllerContextValueType,
} from 'shared/hook-form/form-controller';

const GGVDepositFormDataContext = createContext(null);
GGVDepositFormDataContext.displayName = 'GGVDepositFormDataContext';

type GGV_DEPOSIT_TOKENS =
  | (typeof LIDO_TOKENS)['eth']
  | (typeof LIDO_TOKENS)['steth']
  | (typeof LIDO_TOKENS)['wsteth']
  | 'wETH';

type GGVDepositFormValues = {
  amount: null | bigint;
  token: GGV_DEPOSIT_TOKENS;
};

export const GGVDepositFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const formObject = useForm<GGVDepositFormValues>({
    defaultValues: {
      amount: null,
      token: 'ETH',
    },
    criteriaMode: 'firstError',
    mode: 'onChange',
    // context: validationContext,
    // resolver:
  });
  const { retryEvent } = useFormControllerRetry();

  const formControllerValue = useMemo(
    (): FormControllerContextValueType<GGVDepositFormValues> => ({
      onSubmit: async () => false,
      retryEvent,
    }),
    [retryEvent],
  );

  return (
    <FormProvider {...formObject}>
      <GGVDepositFormDataContext.Provider value={null}>
        <FormControllerContext.Provider value={formControllerValue}>
          {children}
        </FormControllerContext.Provider>
      </GGVDepositFormDataContext.Provider>
    </FormProvider>
  );
};
