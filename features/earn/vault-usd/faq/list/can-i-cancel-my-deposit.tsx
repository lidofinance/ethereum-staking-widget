import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const CanICancelMyDeposit: FC = () => {
  return (
    <AccordionTransparent
      summary="Can I cancel my deposit request?"
      id="earnusd-cancel-deposit"
    >
      <p>
        Yes. If your deposit request has not yet been fulfilled, you can cancel
        it in the Lido UI.
      </p>
    </AccordionTransparent>
  );
};
