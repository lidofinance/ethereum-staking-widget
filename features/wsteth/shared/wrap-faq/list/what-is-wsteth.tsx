import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhatIsWsteth: FC = () => {
  return (
    <Accordion defaultExpanded summary="What is wstETH?">
      <p>
        wstETH (wrapped stETH) is a non-rebasing version of stETH. Unlike the
        stETH balance, which updates every day and communicates your share of
        rewards, the wstETH balance stays the same while the stETH balance
        updates inside the wrapper daily.
      </p>
    </Accordion>
  );
};
