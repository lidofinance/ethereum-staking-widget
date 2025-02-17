import { FC } from 'react';
import { Accordion, Link, Link as OuterLink } from '@lidofinance/lido-ui';

import { config } from 'config';
import { WRAP_PATH } from 'consts/urls';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { LocalLink } from 'shared/components/local-link';

export const HowCanIGetWstethOnUnichain: FC = () => {
  return (
    <Accordion summary="How can I get wstETH on Unichain?">
      <p>
        You can wrap your stETH tokens using the{' '}
        <LocalLink
          href={WRAP_PATH}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnUnichainWrapLink,
            )
          }
          aria-hidden="true"
        >
          Wrap &amp; Unwrap staking widget
        </LocalLink>{' '}
        on Unichain,{' '}
        <Link
          href={`https://superbridge.app/unichain/wstETH`}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnUnichainBridgeYourWstETHFromEthereumToUnichain
          }
        >
          bridge your wstETH from Ethereum to Unichain
        </Link>
        , or use the{' '}
        <OuterLink
          href={`${config.rootOrigin}/lido-ecosystem?tokens=wstETH&categories=Get`}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethOnUnichainIntegrations
          }
        >
          DEX Lido integrations
        </OuterLink>
        .
      </p>
    </Accordion>
  );
};
