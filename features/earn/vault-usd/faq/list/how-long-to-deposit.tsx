import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowLongToDeposit: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How long does it take to deposit?" id={id}>
      <p>
        Deposits are typically fulfilled within ~24 hours under normal
        conditions.
      </p>
    </FaqItem>
  );
};
