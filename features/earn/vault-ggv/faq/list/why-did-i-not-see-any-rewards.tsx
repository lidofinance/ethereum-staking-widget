import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const WhyDidINotSeeAnyRewards: FC = () => {
  return (
    <Accordion
      summary="Why did I not see any rewards after depositing into GGV for just a 3-5 days period?"
      id="why-did-i-not-see-any-rewards"
    >
      <p>
        GGV, like most DeFi vault products, allocates funds into underlying
        strategies (e.g. Uniswap, Aave, Morpho, Balancer, Gearbox, Euler,
        Fluid). Rewards accrue gradually and are reflected in the increasing
        value of GG relative to ETH over time. However, this growth is generally
        slow in the short term. Withdrawing after only 3-5 days is typically
        unfavorable, as strategy fees and market volatility may offset any small
        gains.
      </p>
    </Accordion>
  );
};
