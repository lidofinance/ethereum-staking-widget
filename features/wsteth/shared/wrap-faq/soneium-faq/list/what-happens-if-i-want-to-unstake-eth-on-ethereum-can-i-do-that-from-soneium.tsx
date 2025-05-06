import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { WITHDRAWALS_REQUEST_PATH } from 'consts/urls';
import { LocalLink } from 'shared/components/local-link';
import { trackMatomoEvent } from 'utils/track-matomo-event';

export const WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneium: FC =
  () => {
    return (
      <Accordion summary="What happens if I want to unstake ETH on Ethereum? Can I do that from Soneium?">
        <p>
          You would need to{' '}
          <Link
            href={`https://superbridge.app/soneium`}
            data-matomo={
              MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumBridgeYourWstETHOrStETHBack
            }
          >
            bridge your wstETH or stETH back
          </Link>{' '}
          to Ethereum mainnet first. Once on the mainnet, you can transform your
          wstETH or stETH to ETH using the{' '}
          <LocalLink
            href={WITHDRAWALS_REQUEST_PATH}
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromSoneiumWithdrawalsRequestAndClaim,
              )
            }
            aria-hidden="true"
          >
            Withdrawals Request and Claim
          </LocalLink>{' '}
          tabs.
        </p>
      </Accordion>
    );
  };
