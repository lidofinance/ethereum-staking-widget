import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const HowDoIClaimMyRewards: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="How do I claim my rewards?" id={id}>
      <p>
        Accrued rewards, as well as possible additional rewards, are
        automatically accounted for in the price of earnETH token. Rewards are
        automatically included in your earnETH token balance and are realized
        upon withdrawal into a wstETH-related amount.
      </p>
    </FaqItem>
  );
};
