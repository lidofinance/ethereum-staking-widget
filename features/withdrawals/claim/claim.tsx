import { TransactionModalProvider } from 'shared/transaction-modal/transaction-modal-context';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';
import { FaqPlaceholder } from 'features/ipfs';

import { ClaimForm } from './form';
import { TxClaimModal } from './tx-modal';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

export const Claim = () => {
  return (
    <TransactionModalProvider>
      <ClaimFormProvider>
        <ClaimWallet />
        <ClaimForm />
        <OnlyInfraRender placeholder={<FaqPlaceholder />}>
          <ClaimFaq />
        </OnlyInfraRender>
        <TxClaimModal />
      </ClaimFormProvider>
    </TransactionModalProvider>
  );
};
