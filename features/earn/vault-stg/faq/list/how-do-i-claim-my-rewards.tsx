import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoIClaimMyRewards: FC = () => {
  return (
    <Accordion summary="How do I claim my rewards?">
      <p>
        Accrued rewards, as well as possible additional rewards, are
        automatically accounted for in the price of strETH token. Mellow points
        will become claimable in the future. Rewards are automatically included
        in your strETH token balance and are realized upon withdrawal into a
        wstETH-related amount. Mellow rewards based on points accrued will be
        claimable in the future.
      </p>
    </Accordion>
  );
};
