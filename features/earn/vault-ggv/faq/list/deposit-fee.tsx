import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const DepositFee: FC = () => {
  return (
    <AccordionNavigatable
      summary="What fee applied during my deposit to GGV?"
      id="deposit-fee"
    >
      <p>
        There’s no deposit fee or any other fees during your deposit, but as
        with any Ethereum interaction, there will be a network gas fee.
      </p>
    </AccordionNavigatable>
  );
};
