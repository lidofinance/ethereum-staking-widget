import type { FC } from 'react';
import { Text } from '@lidofinance/lido-ui';

import type { L2SlowStakeStatus } from 'modules/l2-staking';

import { useSlowStakeStatuses } from '../use-slow-stake-statuses';
import { SlowStakeStatusItem } from './slow-stake-status-item';

type SlowStakeStatusesStackProps = {
  title: string;
  statuses: L2SlowStakeStatus[];
  testId: string;
};

const SlowStakeStatusesStack: FC<SlowStakeStatusesStackProps> = ({
  title,
  statuses,
  testId,
}) => {
  if (statuses.length === 0) return null;
  return (
    <div data-testid={testId}>
      <Text size="xs" strong>
        {title}
      </Text>
      {statuses.map((status) => (
        <SlowStakeStatusItem key={status.messageId} status={status} />
      ))}
    </div>
  );
};

// Placeholder list of the user's recent slow stakes as three stacks, by
// what each asks of the user: nothing while loading or without any,
// pending a design
export const SlowStakeStatusesList: FC = () => {
  const { inflight, error, success, hasMore, isLoading } =
    useSlowStakeStatuses();

  if (isLoading) return null;
  if (inflight.length + error.length + success.length === 0) return null;

  return (
    <div data-testid="slowStakeStatuses">
      <SlowStakeStatusesStack
        title="Needs attention"
        statuses={error}
        testId="slowStakeStatusesError"
      />
      <SlowStakeStatusesStack
        title="In progress"
        statuses={inflight}
        testId="slowStakeStatusesInflight"
      />
      <SlowStakeStatusesStack
        title="Completed"
        statuses={success}
        testId="slowStakeStatusesSuccess"
      />
      {hasMore && <Text size="xs">Older stakes are not shown</Text>}
    </div>
  );
};
