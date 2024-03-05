import { TransactionModalProvider } from 'shared/transaction-modal';
import { FaqPlaceholder } from 'features/ipfs';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

import { RequestFormProvider } from './request-form-context';
import { RequestFaq } from '../withdrawals-faq/request-faq';
import { RequestForm } from './form';
import { TxRequestModal } from './tx-modal';
import { RequestWallet } from './wallet';

export const Request = () => {
  return (
    <TransactionModalProvider>
      <RequestFormProvider>
        <RequestWallet />
        <RequestForm />
        <OnlyInfraRender placeholder={<FaqPlaceholder />}>
          <RequestFaq />
        </OnlyInfraRender>
        <TxRequestModal />
      </RequestFormProvider>
    </TransactionModalProvider>
  );
};
