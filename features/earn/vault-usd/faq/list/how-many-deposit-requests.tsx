import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowManyDepositRequests: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How many deposit requests can I have?" id={id}>
      <p>
        You can have <strong>one active request per depositable token</strong>.
        This means you can have up to <strong>two</strong> deposit requests at
        the same time, one for USDC and one for USDT. To create a new request
        for a given token, you must cancel the existing request first.
      </p>
    </FaqItem>
  );
};
