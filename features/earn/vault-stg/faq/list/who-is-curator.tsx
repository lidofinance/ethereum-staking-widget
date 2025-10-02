import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhoIsCurator: FC = () => {
  return (
    <Accordion summary="Who is the curator for stRATEGY, and what’s their role?">
      <p>
        The curator for stRATEGY is Mellow, their role is overseeing strategy
        execution, risk management, and the overall performance of the vault.
      </p>
    </Accordion>
  );
};
