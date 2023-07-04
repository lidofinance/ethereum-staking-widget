import { FC } from 'react';

import { Accordion } from '@lidofinance/lido-ui';

import { LocalLink } from 'shared/components/local-link';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';

export const HowCouldIUnwrapWstethToSteth: FC = () => {
  const queryString = useSafeQueryString();
  return (
    <Accordion summary="How could I unwrap wstETH back to stETH?">
      <p>
        You can unwrap your wstETH tokens using{' '}
        <LocalLink href={`/wrap/unwrap${queryString}`}>
          <a
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqHowDoIUnwrapWstethUnwrapLink,
              )
            }
            aria-hidden="true"
          >
            Wrap &amp; Unwrap staking widget
          </a>
        </LocalLink>
        .
      </p>
    </Accordion>
  );
};
