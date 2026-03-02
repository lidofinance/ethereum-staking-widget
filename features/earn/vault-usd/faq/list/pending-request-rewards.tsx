import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const PendingRequestRewards: FC = () => {
  return (
    <AccordionTransparent
      summary="When I request the deposit and it's pending, when I start getting the rewards?"
      id="earnusd-pending-rewards"
    >
      <p>
        Once your deposit request is processed and earnUSD tokens are issued,
        your assets immediately begin earning rewards, with the token value
        adjusting over time.
      </p>
      <p>
        <strong>
          Note that earnUSD tokens continue to accrue rewards in the vault
          whether or not you claim them.
        </strong>
      </p>
    </AccordionTransparent>
  );
};
