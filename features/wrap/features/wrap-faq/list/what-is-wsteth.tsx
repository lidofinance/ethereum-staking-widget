import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

const TITLE = 'What is wstETH?';

export const WhatIsWsteth: FC = () => {
  return (
    <Accordion defaultExpanded summary={TITLE}>
      <p>
        wstETH is a wrapped version of stETH. Due to the nature of Lido, the
        amount of stETH on your balance is not constant - it changes daily as
        staking rewards come in. As some DeFi protocols require a constant
        balance mechanism for tokens, wstETH keeps your balance of stETH fixed
        and uses an underlying share system to reflect your earned staking
        rewards.
      </p>
      <span>Example:</span>
      <ul>
        <li>You wrap 100 stETH to 99.87 wstETH.</li>
        <li>You continue to earn rewards on your wstETH.</li>
        <li>When you unwrap your wstETH, you receive 101 stETH.</li>
      </ul>
    </Accordion>
  );
};
