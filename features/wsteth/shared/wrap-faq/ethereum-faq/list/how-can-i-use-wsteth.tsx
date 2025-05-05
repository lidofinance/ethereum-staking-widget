import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

import { config } from 'config';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

export const HowCanIUseWsteth: FC = () => {
  return (
    <Accordion summary="How can I use wstETH?">
      <p>
        wstETH is useful across{' '}
        <Link
          href={`${config.rootOrigin}/lido-ecosystem?networks=arbitrum%2Coptimism`}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethLidoMultichain
          }
        >
          Lido Multichain
        </Link>{' '}
        and other{' '}
        <Link
          href={`${config.rootOrigin}/lido-ecosystem?tokens=wstETH`}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethDefiProtocols
          }
        >
          DeFi protocols
        </Link>
        , which are based on constant balance tokens.
      </p>
    </Accordion>
  );
};
