import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { config } from 'config';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatIsAprForDVV: FC = () => {
  const LIDO_APR_PATH = `${config.docsOrigin}/integrations/api/#lido-apr`;
  const LIDO_APR_PATH_TEXT = 'Learn more';
  const SSV_OBOL_REWARDS_PATH =
    'https://docs.mellow.finance/dvsteth-vault/overview';

  return (
    <AccordionNavigatable
      summary="What is APR for DVV, and how is it calculated?"
      id="what-is-apr-for-dvv"
    >
      <p>
        APR is the annual percentage rate without compounding. DVV APR is net
        APR nominated in ETH and consists of stETH APR, SSV, and Obol rewards:
      </p>
      <ul>
        <li>
          stETH APR based on Lido’s Ethereum staking rewards.{' '}
          <Link href={LIDO_APR_PATH}>{LIDO_APR_PATH_TEXT}</Link>.
        </li>
        <li>
          SSV and Obol rewards calculated daily based on token-to-ETH prices,
          vault liquidity, and reward distributions. You can find the full
          formula in the{' '}
          <Link href={SSV_OBOL_REWARDS_PATH}>documentation.</Link>
        </li>
      </ul>
      <p>
        <i>
          Please note that APR figures are only estimates and subject to change
          at any time. Past performance is not a guarantee of future results.
          Rewards are influenced by factors outside the platform’s control,
          including changes to blockchain protocols and validator performance.
        </i>
      </p>
    </AccordionNavigatable>
  );
};
