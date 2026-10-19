import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

import { lidoEcosystemPath } from 'utils/lido-ecosystem-path';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

export const HowCanIUseWstethOnUnichain: FC = () => {
  return (
    <Accordion summary="How can I use wstETH on Unichain?">
      <p>
        wstETH is useful across{' '}
        <Link
          href={lidoEcosystemPath({ tokens: ['wstETH'] })}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethOnUnichainDefiProtocols
          }
        >
          DeFi protocols
        </Link>
        , which are based on constant balance tokens.
      </p>
    </Accordion>
  );
};
