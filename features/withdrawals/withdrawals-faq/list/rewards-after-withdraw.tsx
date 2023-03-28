import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const RewardsAfterWithdraw: FC = () => {
  return (
    <Accordion summary="Do I still get rewards after I withdraw?">
      <p>
        No. During the withdrawal period, the stETH/wstETH submitted for
        unstaking will not receive any staking rewards.
      </p>
    </Accordion>
  );
};
