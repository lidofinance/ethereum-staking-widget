import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { config } from 'config';

export const WhatIsAprForDVV: FC = () => {
  const LIDO_APR_PATH = `${config.docsOrigin}/integrations/api/#lido-apr`;
  const SSV_OBOL_REWARDS_PATH =
    'https://docs.mellow.finance/dvsteth-vault/overview';

  return (
    <Accordion summary="What is APR for DVV, and how is it calculated?">
      <p>
        DVV APR is nominated in ETH and consists of stETH APR, SSV and Obol
        rewards:
      </p>
      <ul>
        <li>
          stETH APR based on Lido’s Ethereum staking rewards.{' '}
          <Link href={LIDO_APR_PATH}>Learn more.</Link>
        </li>
        <li>
          SSV and Obol rewards calculated daily based on token-to-ETH prices,
          vault liquidity, and reward distributions. Find the full formula in
          the <Link href={SSV_OBOL_REWARDS_PATH}>documentation.</Link>
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
    </Accordion>
  );
};
