import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';
import { Link } from '@lidofinance/lido-ui';

export const WhatIsApyForEarnUsd: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem
      summary="What is APY for EarnUSD, and how is it calculated?"
      id={id}
    >
      <p>
        EarnUSD APY comes from continuous reward generation across the
        underlying apps and protocols (e.g., lending, staking, liquidity
        provision) within the relevant subVaults. These rewards are
        automatically compounded into the vault, so your earnUSD tokens increase
        in value over time without requiring manual action. Details can be found{' '}
        <Link target="_blank" href="https://metavaults.mellow.finance/apy">
          here
        </Link>
        .
      </p>
      <p>
        <em>
          Please note that APY figures are estimates and may change at any time.
          Past performance is not a guarantee of future results. Rewards are
          influenced by factors outside the platform&apos;s control, including
          changes to blockchain protocols and validator performance.
        </em>
      </p>
    </FaqItem>
  );
};
