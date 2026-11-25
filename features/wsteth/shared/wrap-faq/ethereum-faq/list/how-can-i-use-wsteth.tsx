import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

import { CHAINS } from 'config';
import { lidoEcosystemPath } from 'utils/lido-ecosystem-path';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

export const HowCanIUseWsteth: FC = () => {
  return (
    <Accordion summary="How can I use wstETH?">
      <p>
        wstETH is useful across{' '}
        <Link
          href={lidoEcosystemPath({
            chainIds: [CHAINS.Arbitrum, CHAINS.Optimism],
          })}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowCanIUseWstethLidoMultichain
          }
        >
          Lido Multichain
        </Link>{' '}
        and other{' '}
        <Link
          href={lidoEcosystemPath({ tokens: ['wstETH'] })}
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
