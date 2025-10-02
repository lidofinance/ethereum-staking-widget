import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const HowLongToDeposit: FC = () => {
  return (
    <Accordion summary="How long does it take to deposit?">
      <p>
        Deposits are typically fulfilled within ~24 hours under normal
        conditions. When I request the deposit and it’s pending, when I start
        getting the rewards? Once your deposit request is processed and stRATEGY
        tokens are issued, your funds immediately begin participating in the
        vault and earning rewards, with token value adjusting over time.
      </p>
      <p>
        Note that strETH tokens continue to accrue rewards in the vault whether
        or not you claim them!
      </p>
    </Accordion>
  );
};
