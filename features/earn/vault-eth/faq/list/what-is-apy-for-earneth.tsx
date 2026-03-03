import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const WhatIsApyForEarnEth: FC = () => {
  return (
    <AccordionTransparent
      summary="What is APY for EarnETH, and how is it calculated?"
      id="earneth-apy"
    >
      <p>
        EarnETH APY comes from continuous reward generation across its
        underlying apps and protocols (e.g., lending, staking, liquidity
        provision) within the relevant subVaults. These rewards are
        automatically compounded into the vault, so your earnETH tokens increase
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
