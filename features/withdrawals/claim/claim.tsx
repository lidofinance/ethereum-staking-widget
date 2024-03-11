import { FaqPlaceholder } from 'features/ipfs';

import { ClaimFaq } from '../withdrawals-faq/claim-faq';
import { ClaimForm } from './form';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

export const Claim = () => {
  return (
    <ClaimFormProvider>
      <ClaimWallet />
      <ClaimForm />
      <OnlyInfraRender renderIPFS={<FaqPlaceholder />}>
        <ClaimFaq />
      </OnlyInfraRender>
    </ClaimFormProvider>
  );
};
