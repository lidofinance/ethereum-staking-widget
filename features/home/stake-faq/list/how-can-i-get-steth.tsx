import Link from 'next/link';
import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCanIGetSteth: FC = () => {
  return (
    <Accordion summary="How can I get stETH?">
      <p>
        You can get stETH many ways, including interacting with the smart
        contract directly.Yet, it is much easier to use a{' '}
        <Link href={'/'}>
          <a
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthWidget,
              )
            }
            aria-hidden="true"
          >
            Lido Ethereum staking widget
          </a>
        </Link>{' '}
        and in other{' '}
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
