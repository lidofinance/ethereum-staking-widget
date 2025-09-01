import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const CanICancelWithdrawalRequest: FC = () => {
  return (
    <Accordion summary="Can I cancel my withdrawal request?">
      <p>
        Yes. If your withdrawal request has not yet been fulfilled, you can
        cancel it in the Lido UI.
      </p>
    </Accordion>
  );
};
