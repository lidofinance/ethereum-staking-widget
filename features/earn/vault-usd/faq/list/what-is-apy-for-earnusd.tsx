import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatIsApyForEarnUsd: FC = () => {
  return (
    <AccordionTransparent
      summary="What is APY for EarnUSD, and how is it calculated?"
      id="earnusd-apy"
    >
      <p>
        EarnUSD APY comes from continuous reward generation across the
        underlying apps and protocols (e.g., lending, staking, liquidity
        provision) within the relevant subVaults. These rewards are
        automatically compounded into the vault, so your earnUSD tokens increase
        in value over time without requiring manual action. Details can be found{' '}
        <a href="https://metavaults.mellow.finance/apy">here</a>.
      </p>
      <p>
        <em>
          Please note that APY figures are estimates and may change at any time.
          Past performance is not a guarantee of future results. Rewards are
          influenced by factors outside the platform&apos;s control, including
          changes to blockchain protocols and validator performance.
        </em>
      </p>
    </AccordionTransparent>
  );
};
