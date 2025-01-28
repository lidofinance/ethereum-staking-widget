import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const DoINeedToClaimMyStakingRewardsIfIWrapStETHToWstETHOnSoneium: FC =
  () => {
    return (
      <Accordion summary="Do I need to claim my staking rewards if I wrap stETH to wstETH on Soneium?">
        <p>No, staking rewards accrue to wstETH automatically.</p>
      </Accordion>
    );
  };
