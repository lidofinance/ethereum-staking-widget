import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';

import { LocalLink } from 'shared/components/header/components/navigation/local-link';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';
import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';

export const HowCanIGetWsteth: FC = () => {
  const queryString = useSafeQueryString();

  return (
    <Accordion summary="How can I get wstETH?">
      <p>
        You can wrap your stETH or ETH tokens using{' '}
        <LocalLink href={`/wrap${queryString}`}>
          <a
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethWrapLink,
              )
            }
            aria-hidden="true"
          >
            Wrap &amp; Unwrap staking widget
          </a>
        </LocalLink>{' '}
        or{' '}
        <OuterLink
          href={'https://lido.fi/lido-ecosystem?tokens=wstETH&categories=Get'}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthIntegrations}
        >
          DEX Lido integrations
        </OuterLink>
      </p>
    </Accordion>
  );
};
