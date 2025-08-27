import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const DepositFee: FC = () => {
  return (
    <Accordion summary="What fee is applied during my deposit to DVV?">
      <p>
        There’s no deposit fee or any other fees during your deposit, but as
        with any Ethereum interaction, there will be a network gas fee.
      </p>
    </Accordion>
  );
};
