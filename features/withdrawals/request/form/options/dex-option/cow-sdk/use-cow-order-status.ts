import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useDappStatus } from 'modules/web3';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_TX_EVENTS_TYPES } from 'consts/matomo';

import { ORDER_POLL_INTERVAL } from '../consts';
import { cowApi } from './cow-api';
import type { CowOrderStatus } from './types';

const TERMINAL_STATUSES: CowOrderStatus[] = [
  'fulfilled',
  'expired',
  'cancelled',
];

type UseCowOrderStatusProps = {
  orderUid: string | null;
  onFulfilled?: () => void;
};

export const useCowOrderStatus = ({
  orderUid,
  onFulfilled,
}: UseCowOrderStatusProps) => {
  const { chainId } = useDappStatus();

  const { data: order } = useQuery({
    queryKey: ['cow-order-status', chainId, orderUid],
    queryFn: async () => {
      const result = await cowApi.getOrder(chainId, orderUid!);

      // Fire Matomo events on terminal status
      if (result.status === 'fulfilled') {
        trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapFinish);
        onFulfilled?.();
      } else if (
        result.status === 'expired' ||
        result.status === 'cancelled'
      ) {
        trackMatomoEvent(MATOMO_TX_EVENTS_TYPES.withdrawalDexSwapCancel);
      }

      return result;
    },
    enabled: !!orderUid,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return ORDER_POLL_INTERVAL;
    },
  });

  const status: CowOrderStatus | null = order?.status ?? null;
  const isTerminal = status !== null && TERMINAL_STATUSES.includes(status);

  return { status, isTerminal, order };
};
