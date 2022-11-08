import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { MatomoLink } from 'shared/components';
import { MATOMO_EVENTS } from 'config';

const TITLE = 'What is Lido?';

export const WhatIsLido: FC = () => {
  return (
    <Accordion defaultExpanded summary={TITLE}>
      <p>
        Lido is a liquid staking solution for Beacon chain backed by
        industry-leading staking providers. Lido lets users stake their ETH -
        without locking assets or maintaining infrastructure - whilst
        participating in on-chain activities, e.g. lending.
      </p>
      <p>
        Our goal is to solve the problems associated with initial Beacon chain
        staking - illiquidity, immovability and accessibility - making staked
        ETH liquid and allowing for participation with any amount of ETH to
        improve security of the Ethereum network.
      </p>
      <p>
        As part of our continuing efforts to be a force for decentralization, we
        have published a{' '}
        <MatomoLink
          href="https://lido.fi/scorecard"
          matomoEvent={MATOMO_EVENTS.clickFaqWhatIsLidoScorecard}
        >
          scorecard
        </MatomoLink>{' '}
        for community input and accountability.
      </p>
      <p>
        Learn more{' '}
        <MatomoLink
          href="https://blog.lido.fi/introducing-lido/"
          matomoEvent={MATOMO_EVENTS.clickFaqWhatIsLidoLearnMore}
        >
          here
        </MatomoLink>
      </p>
    </Accordion>
  );
};
