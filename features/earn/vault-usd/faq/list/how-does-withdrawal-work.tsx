import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowDoesWithdrawalWork: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How does the withdrawal work?" id={id}>
      <p>You can withdraw from EarnUSD to USDC or USDT.</p>
      <p>The withdrawal process has two steps:</p>
      <ul>
        <li>
          <strong>Request withdrawal</strong> by issuing a withdrawal request
          from earnUSD to USDC or USDT.
          <ul>
            <li>
              <strong>USDC — instant or queued.</strong> If the buffer has
              enough liquidity to cover your request, it&apos;s fulfilled
              instantly. Otherwise, your request enters the withdrawal queue,
              which is typically settled within ~72 hours.
            </li>
            <li>
              <strong>USDT — queued only.</strong> USDT withdrawals are always
              processed asynchronously through the withdrawal queue, typically
              settled within ~72 hours. Instant fulfillment from the buffer is
              not available for USDT.
            </li>
          </ul>
        </li>
        <li>
          <strong>Claim</strong> your USDC or USDT once the withdrawal request
          has been processed.
        </li>
      </ul>
    </FaqItem>
  );
};
