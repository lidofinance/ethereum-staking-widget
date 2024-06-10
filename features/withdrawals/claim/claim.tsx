import { FaqPlaceholder } from 'features/ipfs';

import { OnlyInfraRender } from 'shared/components/only-infra-render';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { ClaimFaq } from '../withdrawals-faq/claim-faq';
import { ClaimForm } from './form';
import { ClaimWallet } from './wallet';
import { ClaimFormProvider } from './claim-form-context';

export const Claim = () => {
  return (
    <ClaimFormProvider>
      <NoSSRWrapper>
        <ClaimWallet />
        <ClaimForm />
      </NoSSRWrapper>

      <OnlyInfraRender renderIPFS={<FaqPlaceholder />}>
        <ClaimFaq />
      </OnlyInfraRender>
    </ClaimFormProvider>
  );
};
