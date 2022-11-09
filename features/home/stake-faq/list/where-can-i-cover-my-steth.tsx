import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_EVENTS_TYPES } from 'config';

const TITLE = 'Where can I cover my stETH?';

export const WhereCanICoveMySteth: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <span>
        There are multiple coverage providers with different products for stETH
        & derivatives:
      </span>
      <ul>
        <li>
          <Link
            href="https://bridgemutual.io/"
            data-matomo={MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverBridgeMutual}
          >
            Bridge Mutual
          </Link>
        </li>
        <li>
          <Link
            href="https://idle.finance/"
            data-matomo={MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverIdleFinance}
          >
            Idle Finance
          </Link>
        </li>
        <li>
          <Link
            href="https://nexusmutual.io/"
            data-matomo={MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverNexusMutual}
          >
            Nexus Mutual
          </Link>
        </li>
        <li>
          <Link
            href="https://app.ribbon.finance/"
            data-matomo={
              MATOMO_EVENTS_TYPES.clickFaqWhereCanICoverRibbonFinance
            }
          >
            Ribbon Finance
          </Link>
        </li>
      </ul>
      <p>Сheck with providers for coverage conditions.</p>
    </Accordion>
  );
};
