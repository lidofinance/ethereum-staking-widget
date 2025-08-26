import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const PendingRequestRewards: FC = () => {
  return (
    <Accordion summary="When I request the withdrawal and it’s pending, do I still get the rewards?">
      <p>
        No, once you create the withdrawal request, the rewards you were getting
        on your deposit amount will stop generating.
      </p>
    </Accordion>
  );
};
