import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

export const LidoEthApr: FC = () => {
  return (
    <Accordion summary="What is Lido staking APR for Ethereum?">
      <p>Lido staking APR for Ethereum = Protocol APR * (1 - Protocol fee)</p>
      <p>
        Protocol APR — the overall Consensus Layer (CL) and Execution Layer (EL)
        rewards received by Lido validators to total pooled ETH estimated as the
        moving average of the last seven days.
      </p>
      <p>
        Protocol fee — Lido applies a 10% fee on staking rewards that are split
        between node operators and the DAO Treasury.
      </p>
      <p>
        Please note that APR figures are only estimates and subject to change at
        any time. Past performance is not a guarantee of future results. Rewards
        are influenced by factors outside the platform’s control, including
        changes to blockchain protocols and validator performance.
      </p>
      <p>
        You can find more about Lido staking APR for Ethereum on the{' '}
        <Link
          href={`${config.rootOrigin}/ethereum`}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqLidoEthAprEthLandingPage}
        >
          Ethereum landing page
        </Link>{' '}
        and in our{' '}
        <Link
          href={`${config.docsOrigin}/#liquid-staking`}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqLidoEthAprDocs}
        >
          Docs
        </Link>
        .
      </p>
    </Accordion>
  );
};
