import type { FC } from 'react';
import { Text } from '@lidofinance/lido-ui';

import { useSlowStakeStatuses } from '../use-slow-stake-statuses';
import { SlowStakeStatusItem } from './slow-stake-status-item';
import { SlowStakeStatusListContainer } from './styles';

export const SlowStakeStatusesList: FC = () => {
  const { inflight, error, success, hasMore, isLoading } =
    useSlowStakeStatuses();

  if (isLoading) return null;
  if (inflight.length + error.length + success.length === 0) return null;

  return (
    <SlowStakeStatusListContainer data-testid="slowStakeStatuses">
      {error.map((status) => (
        <SlowStakeStatusItem key={status.messageId} status={status} />
      ))}
      {inflight.map((status) => (
        <SlowStakeStatusItem key={status.messageId} status={status} />
      ))}
      {success.map((status) => (
        <SlowStakeStatusItem key={status.messageId} status={status} />
      ))}
      {hasMore && <Text size="xs">There is more</Text>}
    </SlowStakeStatusListContainer>
  );
};
