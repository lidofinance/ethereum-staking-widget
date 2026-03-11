import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhatIsEarnUsdToken: FC = () => {
  return (
    <FaqItem summary="What is earnUSD token?" id="earnusd-token">
      <p>
        The earnUSD token represents your share of the EarnUSD vault. Its value
        reflects the amount you deposited and the vault&apos;s performance.
      </p>
    </FaqItem>
  );
};
