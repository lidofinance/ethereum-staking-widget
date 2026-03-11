import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const CanICreateANewDepositRequest: FC = () => {
  return (
    <FaqItem
      summary="If I don't claim my deposited amount, can I create a new deposit request?"
      id="earnusd-new-deposit"
    >
      <p>
        Yes. Once your earnUSD is available to claim, you can submit another
        deposit request. However, when you create a new request, the claimable
        amount will be automatically transferred to your wallet as part of the
        new deposit transaction.
      </p>
    </FaqItem>
  );
};
