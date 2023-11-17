import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/local-link';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCanIUnstakeSteth: FC = () => {
  return (
    <Accordion summary="How can I unstake stETH?">
      <p>
        You can use our{' '}
        <LocalLink href="/withdrawals/claim">
          <a
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUnstakeStEthWithdrawals,
              )
            }
            aria-hidden="true"
          >
            Withdrawals Request and Claim tabs
          </a>
        </LocalLink>{' '}
        to unstake stETH and receive ETH at a 1:1 ratio. Also, you can exchange
        stETH on{' '}
        <OuterLink
          href="https://lido.fi/lido-ecosystem?tokens=stETH&categories=Get"
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUnstakeStEthIntegrations
          }
        >
          DEX Lido integrations
        </OuterLink>
        .
      </p>
    </Accordion>
  );
};
