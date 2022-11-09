import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { MATOMO_EVENTS_TYPES } from 'config';

const TITLE = 'How stETH can be converted to ETH?';

export const StethCanBeConvertedToEth: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <p>
        While there&apos;s no way to withdraw ETH from staking until withdrawals
        are enabled on the Beacon chain, stETH holders may exchange their stETH
        to ETH on liquidity pools such as{' '}
        <Link
          href="https://curve.fi/steth"
          data-matomo={MATOMO_EVENTS_TYPES.clickFaqStethConvertedToEthCurve}
        >
          Curve
        </Link>{' '}
        or{' '}
        <Link
          href="https://app.balancer.fi/#/trade"
          data-matomo={MATOMO_EVENTS_TYPES.clickFaqStethConvertedToEthBalancer}
        >
          Balancer
        </Link>
        .
      </p>
    </Accordion>
  );
};
