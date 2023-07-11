import { RequestFormProvider } from './request-form-context';
import { RequestFaq } from '../withdrawals-faq/request-faq';
import { RequestForm } from './form';
import { TxRequestModal } from './tx-modal';
import { RequestWallet } from './wallet';

export const Request = () => {
  return (
    <RequestFormProvider>
      <RequestWallet />
      <RequestForm />
      <RequestFaq />
      <TxRequestModal />
    </RequestFormProvider>
  );
};
