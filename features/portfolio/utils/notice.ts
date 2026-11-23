import { formatActivityTime } from './activity';

const LIVE_DATA_UNAVAILABLE = 'Live data is temporarily unavailable.';
export const LIMIT_REACHED = 'Request limit reached, try again later';

// a failed load is told even when earlier rows are on screen
export const getActivityMessage = (
  isEmpty: boolean,
  isError: boolean,
  isLimited: boolean,
  emptyText: string,
): string | null => {
  if (isLimited) return LIMIT_REACHED;
  if (isError) return 'Activity is temporarily unavailable';
  return isEmpty ? emptyText : null;
};

export const getOtherEmptyText = (
  isError: boolean,
  isLimited: boolean,
): string => {
  if (isLimited) return LIMIT_REACHED;
  if (isError) return 'Other holdings are temporarily unavailable';
  return 'No other holdings found';
};

type NoticeState = {
  // the request limit of this client, not an outage
  isLimited: boolean;
  // only main tokens, read on-chain
  isFallback: boolean;
  // the wallet holds none of them, or they could not be read
  isFallbackEmpty?: boolean;
  // an older answer, as of updatedAt
  isStale: boolean;
  updatedAt?: number;
  isError: boolean;
  isIncomplete: boolean;
  isRewardsError?: boolean;
  isRewardsStale?: boolean;
  rewardsUpdatedAt?: number;
};

export const getStaleNotice = (
  updatedAt: number | undefined,
  dataName = 'data',
) =>
  `${LIVE_DATA_UNAVAILABLE} Showing ${dataName} as of ${formatActivityTime(updatedAt ?? null)}.`;

// one line under the summary; the cause that changes the numbers most wins
export const getPortfolioNotice = ({
  isLimited,
  isFallback,
  isFallbackEmpty = false,
  isStale,
  updatedAt,
  isError,
  isIncomplete,
  isRewardsError = false,
  isRewardsStale = false,
  rewardsUpdatedAt,
}: NoticeState): string | undefined => {
  if (isFallback) {
    const reasonText = isLimited ? `${LIMIT_REACHED}.` : LIVE_DATA_UNAVAILABLE;
    const shownDataText = isFallbackEmpty
      ? 'Totals may be lower.'
      : 'Only main tokens are shown, totals may be lower.';
    return `${reasonText} ${shownDataText}`;
  }
  if (isStale) return getStaleNotice(updatedAt);
  if (isError) return 'Some data could not be loaded, totals may be lower.';
  if (isIncomplete) return 'Some assets are not shown, totals may be lower.';
  // rewards do not change net worth, so they come last
  if (isRewardsStale) return getStaleNotice(rewardsUpdatedAt, 'rewards');
  if (isRewardsError) return 'Rewards are temporarily unavailable.';
  return undefined;
};
