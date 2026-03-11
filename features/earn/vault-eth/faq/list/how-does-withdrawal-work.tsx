import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowDoesWithdrawalWork: FC = () => {
  return (
    <FaqItem
      summary="How does the withdrawal work?"
      id="earneth-withdrawal-work"
    >
      <p>The withdrawal process has two steps:</p>
      <ul>
        <li>
          <strong>Request withdrawal</strong> by issuing a withdrawal request
          from earnETH to wstETH token. Withdrawals are typically fulfilled
          within ~72 hours under normal conditions.
        </li>
        <li>
          <strong>Claim:</strong> Claim your wstETH after the withdrawal request
          has been processed.
        </li>
      </ul>
    </FaqItem>
  );
};
