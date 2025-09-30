import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatIsApyForGGV: FC = () => {
  return (
    <AccordionNavigatable
      summary="What is APY for GGV, and how is it calculated?"
      id="what-is-apy-for-ggv"
    >
      <p>
        APY is the annual percentage yield including compounding. In the context
        of GGV, the APY calculation is the following: the vault’s rewards are
        derived from growth in its net asset value (NAV) over time. The NAV can
        increase through multiple use cases, such as staking, lending, providing
        liquidity on third-party providers. The user’s accrued rewards will
        depend on the portion of the vault that they hold. The APY reflects the
        performance of underlying strategies to which GGV allocates capital.
        Rewards are distributed implicitly into GG’s growing value rather than
        as separate payouts.
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
