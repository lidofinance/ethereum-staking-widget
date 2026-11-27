import { useId, useState, type ReactNode } from 'react';
import {
  Button,
  Divider,
  IconQuestion,
  Skeleton,
  Typography,
  VisuallyHidden,
} from '@lidofinance/lido-app-ui';

import { EarnCard, EarnCardTitle } from 'features/earn/shared/earn-card';

import { AllocationDetails } from './allocation-details';
import { AllocationOverview } from './allocation-overview';
import type { AllocationTableData } from './types';
import { formatUpdatedDate } from './utils';
import { Header, LoadingBlock, Updated, UpdatedTooltip } from './styles';

const ERROR_TEXT = 'Allocation data is not available. Try again later.';
const EMPTY_TEXT = 'No data available for now';

type AllocationHeaderProps = {
  lastUpdated?: number;
  updatedTooltip?: ReactNode;
};

const AllocationHeader = ({
  lastUpdated,
  updatedTooltip,
}: AllocationHeaderProps) => (
  <Header>
    <EarnCardTitle>Portfolio allocation</EarnCardTitle>
    {!!lastUpdated && (
      <Updated data-testid="allocation-updated">
        <Typography as="span" variant="description" color="secondary">
          Updated {formatUpdatedDate(lastUpdated)}
        </Typography>
        {updatedTooltip && (
          <UpdatedTooltip
            content={updatedTooltip}
            icon={<IconQuestion aria-hidden="true" />}
            position="top-end"
            aria-label="About the allocation data"
          />
        )}
      </Updated>
    )}
  </Header>
);

const AllocationLoading = () => (
  <LoadingBlock data-testid="allocation-loading">
    <VisuallyHidden role="status">Loading portfolio allocation</VisuallyHidden>
    <Skeleton variant="text" width={160} height={36} />
    <Skeleton height={16} />
    <Skeleton variant="text" width="60%" height={20} />
  </LoadingBlock>
);

const AllocationContent = ({ data }: { data: AllocationTableData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = useId();

  return (
    <>
      <AllocationOverview
        totalTvlUsd={data.totalTvlUsd}
        chartData={data.chartData}
      />
      <Divider />
      {isExpanded && (
        <AllocationDetails
          id={detailsId}
          groups={data.groups}
          flatItems={data.flatItems}
        />
      )}
      <Button
        variant="ghost"
        size="small"
        fullWidth
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? detailsId : undefined}
        onClick={() => setIsExpanded((value) => !value)}
        data-testid="allocation-toggle"
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </Button>
    </>
  );
};

export type AllocationCardProps = {
  id?: string;
  updatedTooltip?: ReactNode;
  data: AllocationTableData;
  isLoading: boolean;
  isError: boolean;
};

// The view without data fetching, so tests can render every state.
export const AllocationCard = ({
  id,
  updatedTooltip,
  data,
  isLoading,
  isError,
}: AllocationCardProps) => {
  const hasData = data.groups.length > 0 || !!data.flatItems?.length;

  const renderBody = () => {
    if (isLoading) return <AllocationLoading />;

    if (!hasData) {
      return (
        <Typography
          variant="body"
          color="secondary"
          data-testid="no-allocation-data"
        >
          {isError ? ERROR_TEXT : EMPTY_TEXT}
        </Typography>
      );
    }

    return <AllocationContent data={data} />;
  };

  return (
    <EarnCard
      id={id}
      align="stretch"
      gap={24}
      aria-busy={isLoading || undefined}
      data-testid="allocation"
    >
      <AllocationHeader
        lastUpdated={hasData && !isLoading ? data.lastUpdated : undefined}
        updatedTooltip={updatedTooltip}
      />
      {renderBody()}
    </EarnCard>
  );
};
