import { RequestFormProvider } from './request-form-context';
import { RequestForm } from './form';
import { TxRequestModal } from './tx-modal';
import { RequestWallet } from './wallet';
import { TransactionModalProvider } from 'shared/transaction-modal';

export const Request = () => {
  return (
    <TransactionModalProvider>
      <RequestFormProvider>
        <RequestWallet />
        <RequestForm />
        <TxRequestModal />
      </RequestFormProvider>
    </TransactionModalProvider>
  );
};
