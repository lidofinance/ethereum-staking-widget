import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const PendingRequestRewards: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem
      summary="When I request the deposit and it's pending, when I start getting the rewards?"
      id={id}
    >
      <p>
        Once your deposit request is processed and earnUSD tokens are issued,
        your assets immediately begin earning rewards, with the token value
        adjusting over time.
      </p>
      <p>
        <i>
          Note that earnUSD tokens continue to accrue rewards in the vault
          whether or not you claim them.
        </i>
      </p>
    </FaqItem>
  );
};
