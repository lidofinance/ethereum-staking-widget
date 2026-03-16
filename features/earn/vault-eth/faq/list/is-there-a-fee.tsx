import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const IsThereAFee: FC = () => {
  return (
    <FaqItem
      summary="Is there a fee on deposits or withdrawals?"
      id="earneth-fee"
    >
      <p>
        There are no additional fees. However, as with any Ethereum transaction,
        you&apos;ll need to pay a network gas fee.
      </p>
    </FaqItem>
  );
};
