import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const DoIStillGetStakingRewardsWithStETHOrWstETHOnSoneium: FC = () => {
  return (
    <Accordion summary="Do I still get staking rewards with stETH or wstETH on Soneium?">
      <p>
        Yes, wrapped stETH gets staking rewards at the same rate as regular
        stETH. When you keep your stETH in a wrapper, you cannot see your daily
        staking rewards. However, when you unwrap your wstETH your new stETH
        balance will have increased relative to the pre-wrapped amount to
        reflect your received rewards, regardless of whether it&apos;s held on
        Ethereum or Soneium.
      </p>
    </Accordion>
  );
};
