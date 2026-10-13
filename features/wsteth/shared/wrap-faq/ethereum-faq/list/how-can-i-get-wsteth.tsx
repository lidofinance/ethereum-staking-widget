import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';

import { config } from 'config';
import { WRAP_PATH } from 'consts/urls';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { Link } from 'shared/components/link';

export const HowCanIGetWsteth: FC = () => {
  return (
    <Accordion summary="How can I get wstETH?">
      <p>
        You can wrap your stETH or ETH tokens using{' '}
        <Link
          href={WRAP_PATH}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethWrapLink,
            )
          }
          aria-hidden="true"
        >
          Wrap &amp; Unwrap staking widget
        </Link>{' '}
        or{' '}
        <OuterLink
          href={`${config.rootOrigin}/lido-ecosystem?tokens=wstETH&categories=Get`}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthIntegrations}
        >
          DEX Lido integrations
        </OuterLink>
        .
      </p>
    </Accordion>
  );
};
