import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowLongToWithdraw: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How long does it take to withdraw?" id={id}>
      <p>
        Typically, it takes up to 3 days, though it may be faster. You can check
        progress in the Withdrawal section of the EarnUSD UI.
      </p>
    </FaqItem>
  );
};
