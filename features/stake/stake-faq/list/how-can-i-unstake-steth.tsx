import { FC } from 'react';

import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';

import { config } from 'config';
import { WITHDRAWALS_CLAIM_PATH } from 'consts/urls';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { LocalLink } from 'shared/components/local-link';

export const HowCanIUnstakeSteth: FC = () => {
  return (
    <Accordion summary="How can I unstake stETH?">
      <p>
        You can use our{' '}
        <LocalLink
          href={WITHDRAWALS_CLAIM_PATH}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUnstakeStEthWithdrawals,
            )
          }
          aria-hidden="true"
        >
          Withdrawals Request and Claim tabs
        </LocalLink>{' '}
        to unstake stETH and receive ETH at a 1:1 ratio. Also, you can exchange
        stETH on{' '}
        <OuterLink
          href={`${config.rootOrigin}/lido-ecosystem?tokens=stETH&categories=Get`}
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
