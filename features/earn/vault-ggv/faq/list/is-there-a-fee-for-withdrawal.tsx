import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const IsThereAFeeForWithdrawal: FC = () => {
  return (
    <Accordion summary="Is there a fee for withdrawal?">
      <p>
        There’s no withdrawal fee. However, as with any Ethereum transaction,
        you’ll need to pay a network gas fee.
      </p>
    </Accordion>
  );
};
