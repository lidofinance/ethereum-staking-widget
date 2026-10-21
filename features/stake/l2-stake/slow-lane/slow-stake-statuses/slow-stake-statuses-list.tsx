import type { FC } from 'react';
import { Text } from '@lidofinance/lido-ui';

import { useSlowStakeStatuses } from '../use-slow-stake-statuses';
import { SlowStakeStatusItem } from './slow-stake-status-item';

// Placeholder list of the user's recent slow stakes: nothing while loading
// or without any, pending a design
export const SlowStakeStatusesList: FC = () => {
  const { statuses, hasMore, isLoading } = useSlowStakeStatuses();

  if (isLoading || statuses.length === 0) return null;

  return (
    <div data-testid="slowStakeStatuses">
      {statuses.map((status) => (
        <SlowStakeStatusItem key={status.messageId} status={status} />
      ))}
      {hasMore && <Text size="xs">Older stakes are not shown</Text>}
    </div>
  );
};
