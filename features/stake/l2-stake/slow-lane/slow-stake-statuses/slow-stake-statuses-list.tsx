import type { FC } from 'react';

import { useSlowStakeStatuses } from '../use-slow-stake-statuses';
import { SlowStakeStatusItem } from './slow-stake-status-item';
import { SlowStakeStatusListContainer } from './styles';

export const SlowStakeStatusesList: FC = () => {
  const { inflight, error, success, isLoading } = useSlowStakeStatuses({
    limit: 5,
  });

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
      {/*
        success just for debug
      {success.map((status) => (
        <SlowStakeStatusItem key={status.messageId} status={status} />
      ))} */}
    </SlowStakeStatusListContainer>
  );
};
