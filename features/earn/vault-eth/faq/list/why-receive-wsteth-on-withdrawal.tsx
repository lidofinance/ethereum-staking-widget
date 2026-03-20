import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq/faq-item';

export const WhyReceiveWstethOnWithdrawal: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem
      summary="Why, even though deposits are made in ETH, do I only receive wstETH on withdrawal?"
      id={id}
    >
      <p>
        Withdrawals are processed in wstETH because this format allows the vault
        to reduce the time to claim and complete a withdrawal.
      </p>
    </FaqItem>
  );
};
