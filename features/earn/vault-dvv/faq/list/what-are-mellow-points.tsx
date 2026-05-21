import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

export const WhatAreMellowPoints: FC = () => {
  const MELLOW_POINTS_DOCS_PATH = 'https://docs.mellow.finance/points/overview';
  const TWITTER_POST_PATH =
    'https://x.com/LidoFinance/status/2044837898235646021';

  return (
    <Accordion summary="What are Mellow points, and how are they calculated?">
      <p>
        <Link href={TWITTER_POST_PATH}>Due to DVV migration</Link>, the points
        are applicable only till the end of April.{' '}
        <Link href={MELLOW_POINTS_DOCS_PATH}>Here</Link> you can find the
        breakdown of what these points consist of.
      </p>
    </Accordion>
  );
};
