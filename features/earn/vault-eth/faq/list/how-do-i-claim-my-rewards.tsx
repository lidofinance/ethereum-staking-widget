import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const HowDoIClaimMyRewards: FC = () => {
  return (
    <AccordionTransparent
      summary="How do I claim my rewards?"
      id="earneth-claim-rewards"
    >
      <p>
        Accrued rewards, as well as possible additional rewards, are
        automatically accounted for in the price of earnETH token. Rewards are
        automatically included in your earnETH token balance and are realized
        upon withdrawal into a wstETH-related amount.
      </p>
    </AccordionTransparent>
  );
};
