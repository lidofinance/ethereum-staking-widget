import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowManyWithdrawalRequests: FC = () => {
  return (
    <FaqItem
      summary="How many withdrawal requests can I have?"
      id="earneth-withdrawal-requests"
    >
      <p>You can have multiple withdrawal requests.</p>
    </FaqItem>
  );
};
