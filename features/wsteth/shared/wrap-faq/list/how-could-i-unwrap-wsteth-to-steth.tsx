import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';
import { WRAP_UNWRAP_PATH } from 'config/urls';
import { LocalLink } from 'shared/components/local-link';

export const HowCouldIUnwrapWstethToSteth: FC = () => {
  return (
    <Accordion summary="How could I unwrap wstETH back to stETH?">
      <p>
        You can unwrap your wstETH tokens using{' '}
        <LocalLink
          href={WRAP_UNWRAP_PATH}
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
