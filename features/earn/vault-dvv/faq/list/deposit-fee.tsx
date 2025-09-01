import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const DepositFee: FC = () => {
  return (
    <AccordionNavigatable
      summary="What fees are applied when I deposit into DVV?"
      id="deposit-fee"
    >
      <p>
        There’s no deposit fee or any other fees during your deposit, but as
        with any Ethereum interaction, there will be a network gas fee.
        Additionally, because DVV’s underlying token is wstETH, both the vault
        and any withdrawn wstETH are subject to Lido’s 10% protocol fee on the
        net staking APR. What fee is applied during my deposit to DVV?
        <br />
        <br />
        There’s no deposit fee or any other fees during your deposit, but as
        with any Ethereum interaction, there will be a network gas fee.
      </p>
    </AccordionNavigatable>
  );
};
