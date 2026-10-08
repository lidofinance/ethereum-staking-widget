import { CHAINS } from 'config/chains';
import { useDappStatus } from 'modules/web3';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo/matomo-tx-events';
import { useCallback } from 'react';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_EVENT_TYPE, MATOMO_INPUT_EVENTS_TYPES } from 'consts/matomo';

type EventType =
  | 'fast_stake_start'
  | 'fast_stake_end'
  | 'fast_stake_weth_start'
  | 'fast_stake_weth_end'
  | 'fast_stake_more_liquidity';

const eventMap = {
  ['fast_stake_start']: {
    [CHAINS.Base]: MATOMO_TX_EVENTS_TYPES.stakeL2StartBase,
    [CHAINS.Linea]: MATOMO_TX_EVENTS_TYPES.stakeL2StartLinea,
    [CHAINS.Arbitrum]: MATOMO_TX_EVENTS_TYPES.stakeL2StartArbitrum,
    [CHAINS.Optimism]: MATOMO_TX_EVENTS_TYPES.stakeL2StartOptimism,
  },
  ['fast_stake_end']: {
    [CHAINS.Base]: MATOMO_TX_EVENTS_TYPES.stakeL2FinishBase,
    [CHAINS.Linea]: MATOMO_TX_EVENTS_TYPES.stakeL2FinishLinea,
    [CHAINS.Arbitrum]: MATOMO_TX_EVENTS_TYPES.stakeL2FinishArbitrum,
    [CHAINS.Optimism]: MATOMO_TX_EVENTS_TYPES.stakeL2FinishOptimism,
  },
  ['fast_stake_weth_start']: {
    [CHAINS.Base]: MATOMO_TX_EVENTS_TYPES.stakeL2WethStartBase,
    [CHAINS.Linea]: MATOMO_TX_EVENTS_TYPES.stakeL2WethStartLinea,
    [CHAINS.Arbitrum]: MATOMO_TX_EVENTS_TYPES.stakeL2WethStartArbitrum,
    [CHAINS.Optimism]: MATOMO_TX_EVENTS_TYPES.stakeL2WethStartOptimism,
  },
  ['fast_stake_weth_end']: {
    [CHAINS.Base]: MATOMO_TX_EVENTS_TYPES.stakeL2WethFinishBase,
    [CHAINS.Linea]: MATOMO_TX_EVENTS_TYPES.stakeL2WethFinishLinea,
    [CHAINS.Arbitrum]: MATOMO_TX_EVENTS_TYPES.stakeL2WethFinishArbitrum,
    [CHAINS.Optimism]: MATOMO_TX_EVENTS_TYPES.stakeL2WethFinishOptimism,
  },
  ['fast_stake_more_liquidity']: {
    [CHAINS.Base]: MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityBase,
    [CHAINS.Linea]: MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityLinea,
    [CHAINS.Arbitrum]: MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityArbitrum,
    [CHAINS.Optimism]: MATOMO_INPUT_EVENTS_TYPES.stakeL2MoreLiquidityOptimism,
  },
} as Record<EventType, Record<number, MATOMO_EVENT_TYPE>>;

export const useTrackStakeEvent = (event: EventType) => {
  const { chainId } = useDappStatus();

  return useCallback(() => {
    const eventToTrack = eventMap[event]?.[chainId];
    if (eventToTrack) {
      trackMatomoEvent(eventToTrack);
    }
  }, [chainId, event]);
};
