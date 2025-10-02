import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const CanICancelMyDeposit: FC = () => {
  return (
    <Accordion summary="Can I cancel my deposit request?">
      <p>
        Yes. If your deposit request has not yet been fulfilled, you can cancel
        it in the Lido UI.
      </p>
    </Accordion>
  );
};
