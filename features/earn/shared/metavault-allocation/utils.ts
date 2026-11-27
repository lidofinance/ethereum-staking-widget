import { LOCALE } from 'config/groups/locale';
import { formatPercent } from 'shared/formatters/format-percent';

import { MIN_ALLOCATION_DISPLAY_PERCENT } from './consts';

export const formatUpdatedDate = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleString(LOCALE, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

// Summary rows below the display limit would show "0%", so hide their share.
export const isShareVisible = (item: {
  allocation: number;
  isSummary?: boolean;
}): boolean =>
  !item.isSummary || item.allocation >= MIN_ALLOCATION_DISPLAY_PERCENT;

export const getBarLabel = (
  items: ReadonlyArray<{
    name: string;
    allocation: number;
    isSummary?: boolean;
  }>,
): string =>
  `Portfolio allocation: ${items
    .map((item) =>
      isShareVisible(item)
        ? `${item.name} ${formatPercent(item.allocation, 'percent')}`
        : item.name,
    )
    .join(', ')}`;
