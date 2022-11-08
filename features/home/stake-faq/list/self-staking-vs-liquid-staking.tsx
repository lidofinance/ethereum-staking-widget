import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

const TITLE = 'What is the difference between self staking and liquid staking?';

export const SelfStakingVsLiquidStaking: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <p>
        Ethereum is soon to be the biggest staking economy in the space.
        However, staking on Beacon chain requires expert knowledge and complex
        and costly infrastructure. There are several reasons why - the main
        being the fact that slashing and offline penalties can get very severe
        if the staking is managed improperly. In addition to this, self-staking
        brings with it a minimum deposit of 32 ETH and a token lock-up which
        could last years.
      </p>
      <p>
        Through the use of a liquid self-staking service such as Lido, users can
        eliminate these inconveniences and receive rewards from non-custodial
        staking backed by industry leaders.
      </p>
    </Accordion>
  );
};
