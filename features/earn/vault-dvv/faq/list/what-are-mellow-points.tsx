import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

export const WhatAreMellowPoints: FC = () => {
  const MELLOW_POINTS_DOCS_PATH = 'https://docs.mellow.finance/points/overview';
  return (
    <Accordion summary="What are Mellow points, and how are they calculated?">
      <p>
        For every hour these N USD stay in a vault, the address holding an LRT
        gets 0.00025*N Mellow points. As a general rule, loyalty points are
        updated hourly. <Link href={MELLOW_POINTS_DOCS_PATH}>Here</Link> you can
        find the breakdown of what these points consist of.
      </p>
    </Accordion>
  );
};
