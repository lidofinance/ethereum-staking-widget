import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { WITHDRAWALS_REQUEST_PATH } from 'consts/urls';
import { Link } from 'shared/components/link';
import { trackMatomoEvent } from 'utils/track-matomo-event';

export const WhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimism: FC =
  () => {
    return (
      <Accordion summary="What happens if I want to unstake ETH on Ethereum? Can I do that from Optimism?">
        <p>
          You would need to{' '}
          <OuterLink
            href={`https://superbridge.app/optimism`}
            data-matomo={
              MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismBridgeYourWstETHOrStETHBack
            }
          >
            bridge your wstETH or stETH back
          </OuterLink>{' '}
          to Ethereum mainnet first. Once on the mainnet, you can transform your
          wstETH or stETH to ETH using the{' '}
          <Link
            href={WITHDRAWALS_REQUEST_PATH}
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqWhatHappensIfIWantToUnstakeETHOnEthereumCanIDoThatFromOptimismWithdrawalsRequestAndClaim,
              )
            }
            aria-hidden="true"
          >
            Withdrawals Request and Claim
          </Link>{' '}
          tabs.
        </p>
      </Accordion>
    );
  };
