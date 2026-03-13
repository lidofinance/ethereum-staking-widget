import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const CanICancelMyDeposit: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="Can I cancel my deposit request?" id={id}>
      <p>
        Yes. If your deposit request has not yet been fulfilled, you can cancel
        it in the Lido UI.
      </p>
    </FaqItem>
  );
};
