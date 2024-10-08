import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';

import { config } from 'config';
import { WRAP_PATH } from 'consts/urls';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { LocalLink } from 'shared/components/local-link';

export const HowCanIGetWstethOnOptimism: FC = () => {
  return (
    <Accordion summary="How can I get wstETH?">
      <p>
        You can wrap your stETH or ETH tokens using{' '}
        <LocalLink
          href={WRAP_PATH}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnOptimismWrapLink,
            )
          }
          aria-hidden="true"
        >
          Wrap &amp; Unwrap staking widget
        </LocalLink>{' '}
        or{' '}
        <OuterLink
          href={`${config.rootOrigin}/lido-ecosystem?tokens=wstETH&categories=Get`}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnOptimismIntegrations
          }
        >
          DEX Lido integrations
        </OuterLink>
      </p>
    </Accordion>
  );
};
