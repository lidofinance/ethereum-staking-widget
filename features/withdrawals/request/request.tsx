import { TransactionModalProvider } from 'shared/transaction-modal';
import { FaqWithMeta } from 'utils/faq';

import { RequestForm } from './form';
import { RequestFormProvider } from './request-form-context';
import { TxRequestModal } from './tx-modal';
import { RequestWallet } from './wallet';

import { RequestFaq } from '../withdrawals-faq/request-faq';

type RequestProps = {
  faqWithMeta: FaqWithMeta | null;
};

export const Request = ({ faqWithMeta }: RequestProps) => {
  return (
    <TransactionModalProvider>
      <RequestFormProvider>
        <RequestWallet />
        <RequestForm />
        {faqWithMeta && <RequestFaq faqWithMeta={faqWithMeta} />}
        <TxRequestModal />
      </RequestFormProvider>
    </TransactionModalProvider>
  );
};
