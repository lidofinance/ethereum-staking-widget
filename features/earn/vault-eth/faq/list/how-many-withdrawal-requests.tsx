import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowManyWithdrawalRequests: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How many withdrawal requests can I have?" id={id}>
      <p>You can have multiple withdrawal requests.</p>
    </FaqItem>
  );
};
