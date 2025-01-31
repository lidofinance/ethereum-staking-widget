import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';

export const HowCanIUseWstethOnSoneium: FC = () => {
  return (
    <Accordion summary="How can I use wstETH on Soneium?">
      <p>
        wstETH is useful across{' '}
        <Link
          href={`${config.rootOrigin}/lido-ecosystem?tokens=wstETH`}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethOnSoneiumDefiProtocols
          }
        >
          DeFi protocols
        </Link>
        , which are based on constant balance tokens.
      </p>
    </Accordion>
  );
};
