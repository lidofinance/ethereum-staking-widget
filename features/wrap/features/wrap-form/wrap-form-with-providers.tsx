import { WrapForm } from './wrap-form';
import { WrapFormProvider } from '../wrap-form-context/wrap-form-context';
import { TransactionModalProvider } from 'features/withdrawals/contexts/transaction-modal-context';

export const WrapFormWithProviders = () => {
  return (
    <TransactionModalProvider>
      <WrapFormProvider>
        <WrapForm />
      </WrapFormProvider>
    </TransactionModalProvider>
  );
};
