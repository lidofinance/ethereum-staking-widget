import Link from 'next/link';
import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const DoINeedToUnwrapMyWsteth: FC = () => {
  return (
    <Accordion summary="Do I need to unwrap my wstETH before requesting withdrawals?">
      <p>
        No, you can transform your wstETH to ETH using the{' '}
        <Link href={'/withdrawals'}>
          <a
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqDoINeedToUnwrapMyWstethWithdrawalsTabs,
              )
            }
            aria-hidden="true"
          >
            Withdrawals Request and Claim tabs
          </a>
        </Link>
        . Note that, under the hood, wstETH will unwrap to stETH first, so your
        request will be denominated in stETH.
      </p>
    </Accordion>
  );
};
