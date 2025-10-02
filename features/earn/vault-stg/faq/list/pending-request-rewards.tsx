import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const PendingRequestRewards: FC = () => {
  return (
    <Accordion summary="When I request the withdrawal and it’s pending, do I still get the rewards?">
      <p>
        Yes. Once you create a withdrawal request, and before your payout is
        allocated, your funds continue earning in the vault. As a result, the
        final claimable amount of wstETH may differ slightly from the initially
        requested seeing amount and it could be higher or lower.
      </p>
    </Accordion>
  );
};
