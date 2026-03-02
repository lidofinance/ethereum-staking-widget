import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowDoIClaimMyRewards: FC = () => {
  return (
    <AccordionTransparent
      summary="How do I claim my rewards?"
      id="earnusd-claim-rewards"
    >
      <p>
        Accrued rewards, as well as possible additional rewards, are
        automatically accounted for in the value of the earnUSD token. Rewards
        are automatically included in your earnUSD token balance and are
        realized upon withdrawal into a USDC-related amount.
      </p>
    </AccordionTransparent>
  );
};
