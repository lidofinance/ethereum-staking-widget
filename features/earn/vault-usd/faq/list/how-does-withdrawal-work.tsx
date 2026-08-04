import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowDoesWithdrawalWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the withdrawal work?" id={id}>
      <p>The withdrawal process has two steps:</p>
      <ul>
        <li>
          <strong>Request withdrawal</strong> by issuing a withdrawal request
          from earnETH to USDC. If the buffer has enough liquidity to cover your
          request, it&apos;s fulfilled instantly. Otherwise, your request enters
          the withdrawal queue, which is typically settled within ~72 hours.
        </li>
        <li>
          <strong>Claim</strong> your USDC once the withdrawal request has been
          processed.
        </li>
      </ul>
    </FaqItem>
  );
};
