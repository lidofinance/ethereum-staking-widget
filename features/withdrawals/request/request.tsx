import { PageFAQ } from '@lidofinance/ui-faq';

import { TransactionModalProvider } from 'shared/transaction-modal';

import { RequestForm } from './form';
import { RequestFormProvider } from './request-form-context';
import { TxRequestModal } from './tx-modal';
import { RequestWallet } from './wallet';

import { RequestFaq } from '../withdrawals-faq/request-faq';

type RequestProps = {
  pageFAQ?: PageFAQ;
};

export const Request = ({ pageFAQ }: RequestProps) => {
  return (
    <TransactionModalProvider>
      <RequestFormProvider>
        <RequestWallet />
        <RequestForm />
        <RequestFaq pageFAQ={pageFAQ} />
        <TxRequestModal />
      </RequestFormProvider>
    </TransactionModalProvider>
  );
};
