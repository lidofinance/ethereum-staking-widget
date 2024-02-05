import { TransactionModalProvider } from 'shared/transaction-modal/transaction-modal-context';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';

import { ClaimForm } from './form';
import { TransactionModalClaim } from './transaction-modal-claim';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';

export const Claim = () => {
  return (
    <TransactionModalProvider>
      <ClaimFormProvider>
        <ClaimWallet />
        <ClaimForm />
        <ClaimFaq />
        <TransactionModalClaim />
      </ClaimFormProvider>
    </TransactionModalProvider>
  );
};
