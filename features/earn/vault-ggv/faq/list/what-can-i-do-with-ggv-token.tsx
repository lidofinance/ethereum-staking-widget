import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatCanIDoWithGGToken: FC = () => {
  return (
    <Accordion summary="What can I do with GG token?">
      <p>
        You can transfer it between wallets and also use them for deposits in
        the future. The GG token may have future DeFi utility. Keep an eye out
        for future announcements on Lido’s official channels.
      </p>
    </Accordion>
  );
};
