import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const DepositFee: FC = () => {
  return (
    <AccordionNavigatable
      summary="What fees are applied when I deposit into GGV?"
      id="deposit-fee"
    >
      <span>
        When you deposit your tokens, you receive GG tokens that represent your
        share of the vault. Your GG token balance never decreases to cover fees,
        instead, fees are reflected in the value of each GG token:
        <ul>
          <li>
            Platform fee (AUM fee): 1% annually, pro-rated for the time your
            deposited tokens stay in the vault, is built into the GG token’s
            price.
          </li>
          <li>
            Performance fee (allocated to Veda): 10% of the yield is deducted
            from gains before they’re reflected in the GG token’s price.
          </li>
        </ul>
        So, while your GG token balance stays the same, the value per token
        adjusts to account for fees and performance.
      </span>
    </AccordionNavigatable>
  );
};
