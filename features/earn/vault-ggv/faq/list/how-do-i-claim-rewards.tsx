import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowDoIClaimRewards: FC = () => {
  return (
    <Accordion summary="How do I claim my rewards?">
      <p>
        Rewards are automatically included in your GG token balance and are
        realized upon withdrawal into a wstETH-related amount.
      </p>
    </Accordion>
  );
};
