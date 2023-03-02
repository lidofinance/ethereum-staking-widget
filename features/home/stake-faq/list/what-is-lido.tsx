import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

export const WhatIsLido: FC = () => {
  return (
    <Accordion defaultExpanded summary="What is Lido?">
      <p>
        Lido is a liquid staking solution for Beacon chain backed by
        industry-leading staking providers. Lido lets users stake their ETH -
        without locking tokens or maintaining infrastructure - whilst
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
        <Link
          href="https://lido.fi/scorecard"
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqWhatIsLidoScorecard}
        >
          scorecard
        </Link>{' '}
        for community input and accountability.
      </p>
      <p>
        Learn more{' '}
        <Link
          href="https://blog.lido.fi/introducing-lido/"
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqWhatIsLidoLearnMore}
        >
          here
        </Link>
      </p>
    </Accordion>
  );
};
