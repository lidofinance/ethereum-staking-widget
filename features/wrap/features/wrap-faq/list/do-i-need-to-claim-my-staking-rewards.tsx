import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

const TITLE =
  'Do I need to claim my staking rewards if I wrap stETH to wstETH?';

export const DoINeedToClaimMyStakingRewards: FC = () => {
  return (
    <Accordion defaultExpanded summary={TITLE}>
      <p>No, staking rewards accrue to wstETH automatically.</p>
    </Accordion>
  );
};
