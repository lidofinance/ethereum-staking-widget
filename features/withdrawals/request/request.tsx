import { FaqPlaceholder } from 'features/ipfs';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

import { RequestFormProvider } from './request-form-context';
import { RequestFaq } from '../withdrawals-faq/request-faq';
import { RequestForm } from './form';
import { RequestWallet } from './wallet';

export const Request = () => {
  return (
    <RequestFormProvider>
      <RequestWallet />
      <RequestForm />
      <OnlyInfraRender placeholder={<FaqPlaceholder />}>
        <RequestFaq />
      </OnlyInfraRender>
    </RequestFormProvider>
  );
};
