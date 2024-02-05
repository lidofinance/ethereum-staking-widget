import { RequestFormProvider } from './request-form-context';
import { RequestFaq } from '../withdrawals-faq/request-faq';
import { RequestForm } from './form';
import { TransactionModalRequest } from './transaction-modal-request';
import { RequestWallet } from './wallet';
import { TransactionModalProvider } from 'shared/transaction-modal';

export const Request = () => {
  return (
    <TransactionModalProvider>
      <RequestFormProvider>
        <RequestWallet />
        <RequestForm />
        <RequestFaq />
        <TransactionModalRequest />
      </RequestFormProvider>
    </TransactionModalProvider>
  );
};
