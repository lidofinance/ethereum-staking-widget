import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

export const HowCanIUseSteth: FC = () => {
  return (
    <Accordion summary="How can I use stETH?">
      <p>
        You can use your stETH as collateral, for lending, and{' '}
        <Link
          href="https://lido.fi/lido-ecosystem"
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseSteth}
        >
          more
        </Link>
        .
      </p>
    </Accordion>
  );
};
