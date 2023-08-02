import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const DoINeedToClaimMyStakingRewards: FC = () => {
  return (
    <Accordion summary="Do I need to claim my staking rewards if I wrap stETH to wstETH?">
      <p>No, staking rewards accrue to wstETH automatically.</p>
    </Accordion>
  );
};
