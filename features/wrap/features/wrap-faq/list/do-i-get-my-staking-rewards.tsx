import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const DoIGetMyStakingRewards: FC = () => {
  return (
    <Accordion summary="Do I get my staking rewards if I wrap stETH to wstETH?">
      <p>
        Yes, wrapped stETH earns staking rewards at the same rate as regular
        stETH. When you keep your stETH in a wrapper you cannot see your daily
        staking rewards. However, when you unwrap your wstETH your new stETH
        balance will have increased relative to pre-wrapped amount to reflect
        your earned rewards.
      </p>
    </Accordion>
  );
};
