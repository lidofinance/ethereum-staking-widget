import { PageFAQ } from '@lidofinance/ui-faq';

import { TransactionModalProvider } from 'shared/transaction-modal';

import { RequestForm } from './form';
import { RequestFormProvider } from './request-form-context';
import { TxRequestModal } from './tx-modal';
import { RequestWallet } from './wallet';

import { RequestFaq } from '../withdrawals-faq/request-faq';

type RequestProps = {
  faq?: {
    pageFAQ?: PageFAQ;
    eTag?: string | null;
  };
};

export const Request = ({ faq }: RequestProps) => {
  return (
    <TransactionModalProvider>
      <RequestFormProvider>
        <RequestWallet />
        <RequestForm />
        <RequestFaq pageFAQ={faq?.pageFAQ} eTag={faq?.eTag} />
        <TxRequestModal />
      </RequestFormProvider>
    </TransactionModalProvider>
  );
};
