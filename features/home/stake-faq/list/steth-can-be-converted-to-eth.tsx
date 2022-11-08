import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';
import { MatomoLink } from 'shared/components';
import { MATOMO_EVENTS } from 'config';

const TITLE = 'How stETH can be converted to ETH?';

export const StethCanBeConvertedToEth: FC = () => {
  return (
    <Accordion summary={TITLE}>
      <p>
        While there&apos;s no way to withdraw ETH from staking until withdrawals
        are enabled on the Beacon chain, stETH holders may exchange their stETH
        to ETH on liquidity pools such as{' '}
        <MatomoLink
          href="https://curve.fi/steth"
          matomoEvent={MATOMO_EVENTS.clickFaqStethConvertedToEthCurve}
        >
          Curve
        </MatomoLink>{' '}
        or{' '}
        <MatomoLink
          href="https://app.balancer.fi/#/trade"
          matomoEvent={MATOMO_EVENTS.clickFaqStethConvertedToEthBalancer}
        >
          Balancer
        </MatomoLink>{' '}
        .
      </p>
    </Accordion>
  );
};
