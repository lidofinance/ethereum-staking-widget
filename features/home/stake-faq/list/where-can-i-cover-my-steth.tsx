import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { MatomoLink } from 'shared/components';
import { MATOMO_EVENTS } from 'config';

const TITLE = 'Where can I cover my stETH?';

export const WhereCanICoveMySteth: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <p>
        There are multiple coverage providers with different products for stETH
        & derivatives:
      </p>
      <ul>
        <li>
          <MatomoLink
            href="https://bridgemutual.io/"
            matomoEvent={MATOMO_EVENTS.clickFaqWhereCanICoverBridgeMutual}
          >
            Bridge Mutual
          </MatomoLink>
        </li>
        <li>
          <MatomoLink
            href="https://idle.finance/"
            matomoEvent={MATOMO_EVENTS.clickFaqWhereCanICoverIdleFinance}
          >
            Idle Finance
          </MatomoLink>
        </li>
        <li>
          <MatomoLink
            href="https://nexusmutual.io/"
            matomoEvent={MATOMO_EVENTS.clickFaqWhereCanICoverNexusMutual}
          >
            Nexus Mutual
          </MatomoLink>
        </li>
        <li>
          <MatomoLink
            href="https://app.ribbon.finance/"
            matomoEvent={MATOMO_EVENTS.clickFaqWhereCanICoverRibbonFinance}
          >
            Ribbon Finance
          </MatomoLink>
        </li>
      </ul>
      <p>Сheck with providers for coverage conditions.</p>
    </Accordion>
  );
};
