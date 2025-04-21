import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { WRAP_UNWRAP_PATH } from 'consts/urls';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { LocalLink } from 'shared/components/local-link';
import { trackMatomoEvent } from 'utils/track-matomo-event';

export const HowCouldIUnwrapWstETHBackToStETHOnOptimism: FC = () => {
  return (
    <Accordion summary="How could I unwrap wstETH back to stETH on Optimism?">
      <p>
        You can unwrap your wstETH tokens using{' '}
        <LocalLink
          href={WRAP_UNWRAP_PATH}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.faqHowCouldIUnwrapWstETHBackToStETHOnOptimismUnwrapLink,
            )
          }
          aria-hidden="true"
        >
          Wrap & Unwrap staking widget
        </LocalLink>
        .
      </p>
    </Accordion>
  );
};
