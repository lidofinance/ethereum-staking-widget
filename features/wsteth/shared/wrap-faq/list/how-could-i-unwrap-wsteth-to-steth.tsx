import { FC } from 'react';

import { Accordion } from '@lidofinance/lido-ui';

import { LocalLink } from 'shared/components/local-link';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCouldIUnwrapWstethToSteth: FC = () => {
  return (
    <Accordion summary="How could I unwrap wstETH back to stETH?">
      <p>
        You can unwrap your wstETH tokens using{' '}
        <LocalLink
          href={`/wrap/unwrap`}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.faqHowDoIUnwrapWstethUnwrapLink,
            )
          }
          aria-hidden="true"
        >
          Wrap &amp; Unwrap staking widget
        </LocalLink>
        .
      </p>
    </Accordion>
  );
};
