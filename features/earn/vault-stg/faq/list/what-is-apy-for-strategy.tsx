import { Link } from '@lidofinance/lido-ui';
import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatIsAPYForStrategy: FC = () => {
  return (
    <AccordionNavigatable
      summary="What is APY for stRATEGY, and how is it calculated?"
      id="what-is-apy-for-stg"
    >
      <p>
        The stRATEGY APY comes from continuous rewards generation across its
        underlying apps and protocols (e.g. lending, staking, liquidity
        provision). All these rewards are automatically compounded into the
        vault, so your strETH tokens grow in value over time without requiring
        manual action. Details can be found{' '}
        <Link href="https://docs.mellow.finance/strategy-vault/rewards">
          here
        </Link>
        .
      </p>
      <p>
        <i>
          Please note that APY figures are only estimates and subject to change
          at any time. Past performance is not a guarantee of future results.
          Rewards are influenced by factors outside the platform’s control,
          including changes to blockchain protocols and validator performance.
        </i>
      </p>
    </AccordionNavigatable>
  );
};
