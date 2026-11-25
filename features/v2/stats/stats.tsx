import { Body, Divider } from '@lidofinance/lido-app-ui';
import { useLidoStats } from 'shared/hooks';

import { toMotionState } from '../utils';

import { StatsStack } from './styles';

export const Stats = () => {
  const { isLoading, data } = useLidoStats();

  const shouldShow =
    !isLoading &&
    data !== undefined &&
    data.rawData.totalStaked != undefined &&
    data.rawData.uniqueAnytimeHolders != undefined;

  return (
    <StatsStack data-state={toMotionState(shouldShow)}>
      <span>
        <Body>
          <b>{data?.totalStaked}</b> staked
        </Body>
      </span>
      <Divider orientation="vertical" />
      <span>
        <Body>
          <b>{data?.stakers}</b> stakers
        </Body>
      </span>
      <Divider orientation="vertical" />
      <span>
        <Body>
          Since <b>2020</b>
        </Body>
      </span>
    </StatsStack>
  );
};
