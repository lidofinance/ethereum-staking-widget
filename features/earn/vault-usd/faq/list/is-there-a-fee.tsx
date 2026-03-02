import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const IsThereAFee: FC = () => {
  return (
    <AccordionTransparent
      summary="Is there a fee on deposits or withdrawals?"
      id="earnusd-deposit-withdraw-fee"
    >
      <p>
        There&apos;s no additional fees. However, as with any Ethereum
        transaction, you&apos;ll need to pay a network gas fee.
      </p>
    </AccordionTransparent>
  );
};
