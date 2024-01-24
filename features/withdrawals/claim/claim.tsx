import { TransactionModalProvider } from 'shared/transaction-modal/transaction-modal-context';
import { FaqWithMeta } from 'utils/faq';

import { ClaimForm } from './form';
import { TxClaimModal } from './tx-modal';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';

import { ClaimFaq } from '../withdrawals-faq/claim-faq';

type ClaimProps = {
  faqWithMeta: FaqWithMeta | null;
};

export const Claim = ({ faqWithMeta }: ClaimProps) => {
  return (
    <TransactionModalProvider>
      <ClaimFormProvider>
        <ClaimWallet />
        <ClaimForm />
        {faqWithMeta && <ClaimFaq faqWithMeta={faqWithMeta} />}
        <TxClaimModal />
      </ClaimFormProvider>
    </TransactionModalProvider>
  );
};
