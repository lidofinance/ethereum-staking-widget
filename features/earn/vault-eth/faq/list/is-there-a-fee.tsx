import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const IsThereAFee: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="Is there a fee on deposits or withdrawals?" id={id}>
      <p>
        There are no additional fees. However, as with any Ethereum transaction,
        you&apos;ll need to pay a network gas fee.
      </p>
    </FaqItem>
  );
};
