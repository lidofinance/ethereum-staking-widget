import type { FC } from 'react';
import { IconRotate, Typography } from '@lidofinance/lido-app-ui';

import { useNow } from '../../hooks';
import { canRefresh, formatLastUpdate } from '../../utils';
import { RefreshButton, UpdateRow } from './styles';

// how often "N min. ago" is counted again
const TICK_MS = 30 * 1000;

type UpdateInfoProps = {
  // when the data was read
  updatedAt?: number;
  // how long the server keeps the data: Refresh is offered only after it
  refreshAfterMs?: number;
  isRefreshing?: boolean;
  // none: the age only, with no button
  onRefresh?: () => void;
  dataTestId?: string;
};

// "Last update N min. ago", with a Refresh button once the answer may be new
export const UpdateInfo: FC<UpdateInfoProps> = ({
  updatedAt,
  refreshAfterMs = 0,
  isRefreshing = false,
  onRefresh,
  dataTestId,
}) => {
  const now = useNow(TICK_MS);
  const showRefresh =
    !!onRefresh && (isRefreshing || canRefresh(updatedAt, now, refreshAfterMs));
  if (!showRefresh && updatedAt == null) return null;

  return (
    <UpdateRow data-testid={dataTestId}>
      {showRefresh && (
        <RefreshButton
          type="button"
          aria-label="Refresh"
          $spinning={isRefreshing}
          disabled={isRefreshing}
          onClick={onRefresh}
        >
          <IconRotate aria-hidden />
        </RefreshButton>
      )}
      {updatedAt != null && (
        <Typography as="span" variant="description" color="secondary">
          Last update {formatLastUpdate(updatedAt, now)}
        </Typography>
      )}
    </UpdateRow>
  );
};
