import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

export const WhereCanICoverMySteth: FC = () => {
  return (
    <Accordion summary="Where can I cover my stETH?">
      <span>
        There are multiple coverage and insurer providers with different
        products for stETH:
      </span>
      <ul>
        <li>
          <Link
            href="https://idle.finance/"
            data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverIdleFinance}
          >
            Idle Finance
          </Link>
        </li>
        <li>
          <Link
            href="https://nexusmutual.io/"
            data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverNexusMutual}
          >
            Nexus Mutual
          </Link>
        </li>
        <li>
          <Link
            href="https://app.ribbon.finance/"
            data-matomo={
              MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverRibbonFinance
            }
          >
            Ribbon Finance
          </Link>
        </li>
        <li>
          <Link
            href="https://www.chainproof.co/"
            data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqWhereCanICoverChainproof}
          >
            Chainproof
          </Link>
        </li>
      </ul>
      <p>Check with providers for coverage and insurer conditions.</p>
    </Accordion>
  );
};
