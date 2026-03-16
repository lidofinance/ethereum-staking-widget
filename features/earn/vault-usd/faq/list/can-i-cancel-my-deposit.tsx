import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const CanICancelMyDeposit: FC = () => {
  return (
    <FaqItem
      summary="Can I cancel my deposit request?"
      id="earnusd-cancel-deposit"
    >
      <p>
        Yes. If your deposit request has not yet been fulfilled, you can cancel
        it in the Lido UI.
      </p>
    </FaqItem>
  );
};
