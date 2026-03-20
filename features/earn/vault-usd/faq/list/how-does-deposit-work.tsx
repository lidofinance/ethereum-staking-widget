import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowDoesDepositWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the deposit work?" id={id}>
      <p>
        You can deposit <strong>USDC or USDT</strong> to receive{' '}
        <strong>earnUSD</strong> share tokens of the EarnUSD vault. Once you
        deposit, earnUSD is issued directly to your wallet, with no pending
        state or separate claim step required
      </p>
    </FaqItem>
  );
};
