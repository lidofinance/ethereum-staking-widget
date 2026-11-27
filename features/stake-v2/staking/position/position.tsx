import { BodyLarge } from '@lidofinance/lido-app-ui';

import { useDappStatus } from 'modules/web3';
import { FormatPercent } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';

import { Loader, toMotionState, useDelayedShow } from '../../utils';

import { StakedPosition } from './staked-position';
import { WithdrawalsSummary } from './withdrawals-summary';
import { BorderedCard, UnconnectedText } from './styles';

const UnconnectedPosition = () => {
  const { isWalletResolving } = useDappStatus();
  const { data, isLoading } = useLidoApr();
  // isWalletResolving also has timeout but much larger,
  // useDelayedShow still UI protects against flashing apr skelton
  const shouldShow = useDelayedShow([isLoading]) && !isWalletResolving;

  const apr = data?.data?.smaApr;

  return (
    <BorderedCard>
      <UnconnectedText data-state={toMotionState(shouldShow)}>
        Stake with{' '}
        {apr && (
          <Loader isLoading={isLoading}>
            <FormatPercent decimals="percent" value={apr} /> APR
          </Loader>
        )}
        <BodyLarge as="span" color="tertiary">
          daily rewards, stay liquid
        </BodyLarge>
      </UnconnectedText>
    </BorderedCard>
  );
};

const ConnectedPosition = () => (
  <BorderedCard>
    <StakedPosition />
    <WithdrawalsSummary />
  </BorderedCard>
);

export const Position = () => {
  const { isWalletConnected } = useDappStatus();

  if (!isWalletConnected) {
    return <UnconnectedPosition />;
  }

  return <ConnectedPosition />;
};
