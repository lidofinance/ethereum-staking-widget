import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatFeesAreApplied: FC = () => {
  return (
    <AccordionNavigatable
      summary="What fees are applied when I deposit into stRATEGY?"
      id="deposit-fee"
    >
      <p>
        When you deposit your tokens, you receive strETH tokens that represent
        your portion of the vault. Your strETH token balance never decreases to
        cover fees, instead, fees are reflected in the value of each strETH
        token:
      </p>
      <ul>
        <li>
          Platform fee (AUM fee): 1% annually, pro-rated for the time your
          deposited tokens stay in the vault, is built into the strETH token’s
          price.
        </li>
        <li>
          Performance fee (allocated to Mellow): 10% of the rewards accrued is
          deducted from gains before it’s reflected in the strETH token’s price.
        </li>
      </ul>
      <p>
        So, while your strETH token balance stays the same, the value per token
        adjusts to account for fees and performance.
      </p>
    </AccordionNavigatable>
  );
};
