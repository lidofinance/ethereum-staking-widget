import { useCallback } from 'react';

import { useDappStatus } from 'modules/web3';
import {
  MATOMO_EVENT_TYPE,
  MATOMO_INPUT_EVENTS_TYPES,
  MATOMO_TX_EVENTS_TYPES,
} from 'consts/matomo';
import {
  trackMatomoEvent,
  type MatomoEventParams,
} from 'utils/track-matomo-event';

type EventType =
  'fast_stake_start' | 'fast_stake_end' | 'fast_stake_more_liquidity';

// chain and token are reported as custom dimensions on the shared staking events
const eventMap: Record<EventType, MATOMO_EVENT_TYPE> = {
  ['fast_stake_start']: MATOMO_TX_EVENTS_TYPES.stakingStart,
  ['fast_stake_end']: MATOMO_TX_EVENTS_TYPES.stakingFinish,
  ['fast_stake_more_liquidity']: MATOMO_INPUT_EVENTS_TYPES.stakingMoreLiquidity,
};

type TrackStakeEventParams = Pick<MatomoEventParams, 'token'>;

export const useTrackStakeEvent = (event: EventType) => {
  const { chainId } = useDappStatus();

  return useCallback(
    ({ token }: TrackStakeEventParams = {}) => {
      trackMatomoEvent(eventMap[event], { chainId, token });
    },
    [chainId, event],
  );
};
