import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const DoINeedToClaimMyStakingRewardsIfIWrapStETHToWstETHOnOptimism: FC =
  () => {
    return (
      <Accordion
        defaultExpanded
        summary="Do I need to claim my staking rewards if I wrap stETH to wstETH on Optimism?"
      >
        <p>No, staking rewards accrue to wstETH automatically.</p>
      </Accordion>
    );
  };
