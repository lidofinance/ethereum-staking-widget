import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
// import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

const PENALTIES_INFO_LINK =
  'https://help.lido.fi/en/articles/5232780-what-are-staking-validator-penalties';

export const WhatIsSlashing: FC = () => {
  return (
    <Accordion summary="What is slashing?">
      <p>
        Slashing is a penalty on validators for intentional or accidental
        misbehavior.
      </p>
      <p>
        Slashing penalties are spread across stakers and may lower your total
        reward amount. For more information, check out{' '}
        <Link
          href={PENALTIES_INFO_LINK}
          // data-matomo={MATOMO_CLICK_EVENTS_TYPES.}
        >
          What Are Staking/Validator Penalties
        </Link>
        .
      </p>
    </Accordion>
  );
};
