import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

export const WhatAreMellowPoints: FC = () => {
  const MELLOW_POINTS_DOCS_PATH =
    'https://docs.mellow.finance/strategy-vault/rewards#points';
  return (
    <Accordion summary="What are Mellow points, and how are they calculated?">
      <p>
        You can find full details about loyalty points{' '}
        <Link href={MELLOW_POINTS_DOCS_PATH}>here</Link>.
      </p>
    </Accordion>
  );
};
