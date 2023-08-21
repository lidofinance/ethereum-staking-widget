import { TransactionModalProvider } from 'features/withdrawals/contexts/transaction-modal-context';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';

import { ClaimForm } from './form';
import { TxClaimModal } from './tx-modal';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';

export const Claim = () => {
  return (
    <TransactionModalProvider>
      <ClaimFormProvider>
        <ClaimWallet />
        <ClaimForm />
        <ClaimFaq />
        <TxClaimModal />
      </ClaimFormProvider>
    </TransactionModalProvider>
  );
};
