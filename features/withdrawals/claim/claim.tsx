import { TransactionModalProvider } from 'shared/transaction-modal/transaction-modal-context';

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
        <TxClaimModal />
      </ClaimFormProvider>
    </TransactionModalProvider>
  );
};
