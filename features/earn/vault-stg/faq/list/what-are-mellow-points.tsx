import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

export const WhatAreMellowPoints: FC = () => {
  const MELLOW_POINTS_DOCS_PATH =
    'https://docs.mellow.finance/strategy-vault/rewards#points';
  return (
    <Accordion summary="What are Mellow points, and how are they calculated?">
      <p>
        The stRATEGY Vault offers boosted Mellow Points for the first 4 weeks
        after launch (starting September 29, 2025):
      </p>
      <ul>
        <li>
          For every $1 of value in your strETH, your wallet earns{' '}
          <b>0.00075 Mellow Points per hour.</b>
        </li>
      </ul>
      <p>After the initial 4 weeks, the rate adjusts to:</p>
      <ul>
        <li>
          For every $1 of value in your strETH, your wallet earns{' '}
          <b>0.00025 Mellow Points per hour.</b>
        </li>
      </ul>
      <p>
        Loyalty points are updated hourly, and you can track the full details{' '}
        <Link href={MELLOW_POINTS_DOCS_PATH}>here</Link>.
      </p>
    </Accordion>
  );
};
