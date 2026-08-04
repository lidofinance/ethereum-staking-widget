import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowLongToWithdraw: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How long does it take to withdraw?" id={id}>
      <p>
        Withdrawal speed depends on the withdrawal amount and the liquidity
        available in the buffer. Withdrawals are instant when the buffer can
        cover your request; larger requests go to the withdrawal queue and are
        usually settled within 72 hours, though bigger sizes may take longer.
        You can check progress in the Withdrawal section of the EarnUSD UI.
      </p>
    </FaqItem>
  );
};
