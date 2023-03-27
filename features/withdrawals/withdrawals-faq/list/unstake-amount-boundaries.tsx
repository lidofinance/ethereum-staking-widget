import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const UnstakeAmountBoundaries: FC = () => {
  return (
    <Accordion summary="Is there any minimum or maximum amount of stETH I can unstake?">
      <p>
        The minimum amount to withdraw is 0.0000000000000001 stETH, and the
        maximum amount is 1000 stETH.
      </p>
      <p>
        If you want to withdraw more than 1000 stETH, your request withdrawal
        will be divided into several requests (you will still only pay one
        transaction fee).
      </p>
    </Accordion>
  );
};
