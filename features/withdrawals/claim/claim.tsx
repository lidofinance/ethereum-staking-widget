import { PageFAQ } from '@lidofinance/ui-faq';

import { TransactionModalProvider } from 'shared/transaction-modal/transaction-modal-context';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';

import { ClaimForm } from './form';
import { TxClaimModal } from './tx-modal';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';

type ClaimProps = {
  pageFAQ?: PageFAQ;
};

export const Claim = ({ pageFAQ }: ClaimProps) => {
  return (
    <TransactionModalProvider>
      <ClaimFormProvider>
        <ClaimWallet />
        <ClaimForm />
        <ClaimFaq pageFAQ={pageFAQ} />
        <TxClaimModal />
      </ClaimFormProvider>
    </TransactionModalProvider>
  );
};
