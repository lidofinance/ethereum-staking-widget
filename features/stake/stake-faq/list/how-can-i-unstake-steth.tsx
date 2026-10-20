import { FC } from 'react';

import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';

import { lidoEcosystemPath } from 'utils/lido-ecosystem-path';
import { WITHDRAWALS_CLAIM_PATH } from 'consts/urls';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { LocalLink } from 'shared/components/local-link';
import { useDappStatus } from 'modules/web3';

export const HowCanIUnstakeSteth: FC = () => {
  const { supportedChainIds } = useDappStatus();
  return (
    <Accordion summary="How can I unstake stETH?">
      <p>
        On Ethereum Mainnet, you can use our{' '}
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
          href={lidoEcosystemPath({ tokens: ['stETH'], categories: ['Get'] })}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUnstakeStEthIntegrations
          }
        >
          DEX Lido integrations
        </OuterLink>
        .
      </p>
      <p>
        On supported L2s, you can exchange wstETH on{' '}
        <OuterLink
          href={lidoEcosystemPath({
            tokens: ['wstETH'],
            categories: ['Get'],
            chainIds: supportedChainIds,
          })}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUnstakeStEthL2Integrations
          }
        >
          DEX Lido integrations
        </OuterLink>
        .
      </p>
    </Accordion>
  );
};
