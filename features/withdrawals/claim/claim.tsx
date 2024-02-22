import { dynamics } from 'config';
import { ClaimFaq } from 'features/withdrawals/withdrawals-faq/claim-faq';
import { ClaimForm } from './form';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';

export const Claim = () => {
  return (
    <ClaimFormProvider>
      <ClaimWallet />
      <ClaimForm />
      {!dynamics.ipfsMode && <ClaimFaq />}
    </ClaimFormProvider>
  );
};
