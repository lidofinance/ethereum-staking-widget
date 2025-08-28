import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const RisksOfDepositing: FC = () => {
  return (
    <AccordionNavigatable
      summary="What are the risks of depositing GGV?"
      id="risks-of-depositing"
    >
      <span>
        As with any DeFi products, there are risks. Please note this list is not
        exhaustive:
      </span>
      <ul>
        <li>Smart contract risk</li>
        <li>Liquidity provision risk - exposure to impermanent loss</li>
        <li>
          Leverage risk - the vault can use leverage, which means positions can
          be liquidated. Safeguards are in place to reduce (but not eliminate)
          this risk.
        </li>
      </ul>
      <span>
        <i>
          Always conduct your own research and consult your own professional
          advisors to understand all potential risks before participating.
        </i>
      </span>
    </AccordionNavigatable>
  );
};
