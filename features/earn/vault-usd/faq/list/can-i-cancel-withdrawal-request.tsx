import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const CanICancelMyWithdrawalRequest: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="Can I cancel my withdrawal request?" id={id}>
      <p>
        No, once the withdrawal request was created, it can&apos;t be cancelled.
      </p>
    </FaqItem>
  );
};
