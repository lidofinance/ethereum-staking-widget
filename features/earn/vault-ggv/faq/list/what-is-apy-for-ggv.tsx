import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatIsApyForGGV: FC = () => {
  return (
    <AccordionNavigatable
      summary="What is APY for GGV, and how is it calculated?"
      id="what-is-apy-for-ggv"
    >
      <p>
        The APY varies depending on the underlying strategies and market
        conditions. Details on the calculation can be seen here.{' '}
        <b>[link to the docs]</b>
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
