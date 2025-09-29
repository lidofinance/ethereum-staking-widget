import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const IsThereAFee: FC = () => {
  return (
    <Accordion summary="Is there a fee on deposits or withdrawals?">
      <p>
        There’s no additional fees. However, as with any Ethereum transaction,
        you’ll need to pay a network gas fee.
      </p>
    </Accordion>
  );
};
