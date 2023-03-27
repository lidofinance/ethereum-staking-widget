import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const SeparateClaim: FC = () => {
  return (
    <Accordion summary="If I have several requests, can I claim them separately?">
      <p>
        Yes. You can choose the requests you want to claim in the Request List
        on the Claim tab.
      </p>
    </Accordion>
  );
};
