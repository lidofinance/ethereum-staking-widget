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
      <Body as="span">
        <b>{data?.totalStaked}</b> staked
      </Body>
      <Divider orientation="vertical" />
      <Body as="span">
        <b>{data?.stakers}</b> stakers
      </Body>
      <Divider orientation="vertical" />
      <Body as="span">
        Since <b>2020</b>
      </Body>
    </StatsStack>
  );
};
