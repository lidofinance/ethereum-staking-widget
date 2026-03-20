import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhatIsEarnUsdToken: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="What is earnUSD token?" id={id}>
      <p>
        The earnUSD token represents your share of the EarnUSD vault. Its value
        reflects the amount you deposited and the vault&apos;s performance.
      </p>
    </FaqItem>
  );
};
