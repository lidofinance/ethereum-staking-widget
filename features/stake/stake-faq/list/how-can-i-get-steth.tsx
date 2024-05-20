import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';

import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { HOME_PATH } from 'consts/urls';
import { LocalLink } from 'shared/components/local-link';

export const HowCanIGetSteth: FC = () => {
  return (
    <Accordion summary="How can I get stETH?">
      <p>
        You can get stETH many ways, including interacting with the smart
        contract directly. Yet, it is much easier to use a{' '}
        <LocalLink
          href={HOME_PATH}
          onClick={() =>
            trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthWidget)
          }
          aria-hidden="true"
        >
          Lido Ethereum staking widget
        </LocalLink>
        , stake your tokens directly from{' '}
        <OuterLink
          href={'https://www.ledger.com/coin/wallet/ethereum'}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthLedger}
        >
          Ledger Ethereum wallet
        </OuterLink>
        , or in other{' '}
        <OuterLink
          href={'https://lido.fi/lido-ecosystem?tokens=stETH&categories=Get'}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthIntegrations}
        >
          DEX Lido integrations
        </OuterLink>
        .
      </p>
    </Accordion>
  );
};
