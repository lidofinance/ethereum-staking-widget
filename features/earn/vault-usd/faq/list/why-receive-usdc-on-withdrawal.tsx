import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhyReceiveUsdcOnWithdrawal: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem
      summary="Why, even though deposits are made in USDC/USDT, do I only receive USDC on withdrawal?"
      id={id}
    >
      <p>
        Withdrawals are processed in USDC because this format allows the vault
        to reduce the time to claim and complete a withdrawal.
      </p>
    </FaqItem>
  );
};
