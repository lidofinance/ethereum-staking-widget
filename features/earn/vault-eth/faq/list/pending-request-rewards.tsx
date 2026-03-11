import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const PendingRequestRewards: FC = () => {
  return (
    <FaqItem
      summary="When I request the deposit and it's pending, when I start getting the rewards?"
      id="earneth-pending-rewards"
    >
      <p>
        Once your deposit request is processed and earnETH tokens are issued,
        your funds immediately begin participating in the vault and earning
        rewards, with the token value adjusting over time.
      </p>
      <p>
        <em>
          Note that earnETH tokens continue to accrue rewards in the vault
          whether or not you claim them!
        </em>
      </p>
    </FaqItem>
  );
};
