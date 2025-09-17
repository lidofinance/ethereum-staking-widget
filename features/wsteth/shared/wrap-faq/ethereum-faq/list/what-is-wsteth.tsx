import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsWsteth: FC = () => {
  return (
    <Accordion summary="What is wstETH?">
      <p>
        wstETH (wrapped stETH) is a non-rebasing version of stETH, wstETH&apos;s
        price denominated in stETH changes instead. The wstETH balance can only
        be changed upon transfers, minting, and burning. At any given time,
        anyone holding wstETH can convert any amount of it to stETH at a fixed
        rate, and vice versa. Normally, the rate gets updated once a day, when
        stETH undergoes a rebase.
      </p>
    </Accordion>
  );
};
