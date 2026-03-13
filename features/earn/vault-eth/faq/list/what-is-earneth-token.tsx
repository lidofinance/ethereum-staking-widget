import { FaqItem } from 'features/earn/shared/v2/faq';
import { FC } from 'react';

export const WhatIsEarnEthToken: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="What is earnETH token?" id={id}>
      <p>
        The earnETH token represents your share of the EarnETH vault. Its value
        reflects the amount you deposited and the vault&apos;s performance.
      </p>
    </FaqItem>
  );
};
