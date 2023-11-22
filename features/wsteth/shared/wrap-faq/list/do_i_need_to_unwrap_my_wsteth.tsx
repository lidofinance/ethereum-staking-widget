import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { WITHDRAWALS_REQUEST_PATH } from 'config/urls';
import { trackMatomoEvent } from 'config/trackMatomoEvent';
import { LocalLink } from 'shared/components/local-link';

export const DoINeedToUnwrapMyWsteth: FC = () => {
  return (
    <Accordion summary="Do I need to unwrap my wstETH before requesting withdrawals?">
      <p>
        No, you can transform your wstETH to ETH using the{' '}
        <LocalLink
          href={WITHDRAWALS_REQUEST_PATH}
          onClick={() =>
            trackMatomoEvent(
              MATOMO_CLICK_EVENTS_TYPES.faqDoINeedToUnwrapMyWstethWithdrawalsTabs,
            )
          }
          aria-hidden="true"
        >
          Withdrawals Request and Claim tabs
        </LocalLink>
        . Note that, under the hood, wstETH will unwrap to stETH first, so your
        request will be denominated in stETH.
      </p>
    </Accordion>
  );
};
