import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const PendingWithdrawalRewards: FC = () => {
  return (
    <AccordionTransparent
      summary="When I request the withdrawal and it's pending, do I still get the rewards?"
      id="earnusd-pending-withdrawal-rewards"
    >
      <p>
        Yes. Once you create a withdrawal request, and before your payout is
        allocated, your assets continue generating rewards in the vault. As a
        result, the final claimable amount of USDC may differ slightly from the
        initially requested seeing amount and it could be higher or lower.
      </p>
    </AccordionTransparent>
  );
};
