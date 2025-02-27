import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const DoINeedToClaimMyStakingRewardsIfIWrapStETHToWstETHOnUnichain: FC =
  () => {
    return (
      <Accordion summary="Do I need to claim my staking rewards if I wrap stETH to wstETH on Unichain?">
        <p>No, staking rewards accrue to wstETH automatically.</p>
      </Accordion>
    );
  };
