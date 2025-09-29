import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsAPYForStrategy: FC = () => {
  return (
    <Accordion summary="What is APY for stRATEGY, and how is it calculated?">
      <p>
        The stRATEGY APY comes from continuous rewards generation across its
        underlying apps and protocols (e.g. lending, staking, liquidity
        provision). All these rewards are automatically compounded into the
        vault, so your strETH tokens grow in value over time without requiring
        manual action.
      </p>
      <p>
        <i>
          Please note that APY figures are only estimates and subject to change
          at any time. Past performance is not a guarantee of future results.
          Rewards are influenced by factors outside the platform’s control,
          including changes to blockchain protocols and validator performance.
        </i>
      </p>
    </Accordion>
  );
};
