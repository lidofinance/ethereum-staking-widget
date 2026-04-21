import { FC } from 'react';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const WhatCanIDoWithEarnUsd: FC<{ id?: string }> = ({ id }) => {
  return (
    <FaqItem summary="What can I do with earnUSD token?" id={id}>
      <p>You can transfer it between wallets and also use it in DeFi.</p>
    </FaqItem>
  );
};
