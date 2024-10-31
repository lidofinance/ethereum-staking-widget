import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';

export const HowCanIUseWstethOnOptimism: FC = () => {
  return (
    <Accordion summary="How can I use wstETH on Optimism?">
      <p>
        wstETH is useful across{' '}
        <Link
          href={`${config.rootOrigin}/lido-ecosystem?tokens=wstETH`}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethOnOptimismDefiProtocols
          }
        >
          DeFi protocols
        </Link>
        , which are based on constant balance tokens.
      </p>
    </Accordion>
  );
};
