import { FaqPlaceholder } from 'features/ipfs';
import { OnlyInfraRender } from 'shared/components/only-infra-render';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { RequestFaq } from '../withdrawals-faq/request-faq';
import { RequestFormProvider } from './request-form-context';
import { RequestForm } from './form';
import { RequestWallet } from './wallet';

export const Request = () => {
  return (
    <RequestFormProvider>
      <NoSSRWrapper>
        <RequestWallet />
        <RequestForm />
      </NoSSRWrapper>

      <OnlyInfraRender renderIPFS={<FaqPlaceholder />}>
        <RequestFaq />
      </OnlyInfraRender>
    </RequestFormProvider>
  );
};
