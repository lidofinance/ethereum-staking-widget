import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhatCanIDoWithEarnEth: FC = () => {
  return (
    <FaqItem summary="What can I do with earnETH token?" id="earneth-token-use">
      <p>
        You can transfer it between wallets. Over time, it may also become
        usable across DeFi.
      </p>
    </FaqItem>
  );
};
