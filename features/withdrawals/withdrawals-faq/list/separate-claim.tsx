import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

import { WITHDRAWALS_CLAIM_PATH } from 'consts/urls';
import { LocalLink } from 'shared/components/local-link';

export const SeparateClaim: FC = () => {
  return (
    <Accordion summary="If I have several requests, can I claim them separately?">
      <p>
        Yes. You can choose the requests you want to claim in the ‘Request List’
        on the <LocalLink href={WITHDRAWALS_CLAIM_PATH}>Claim tab</LocalLink>.
      </p>
    </Accordion>
  );
};
