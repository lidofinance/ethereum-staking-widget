import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';

import {
  DEFAULT_CLAIM_REQUEST_SELECTED,
  MAX_REQUESTS_COUNT,
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
} from 'features/withdrawals/withdrawals-constants';

export const useMaxSelectedCount = () => {
  const isLedgerLive = useIsLedgerLive();
  const maxSelectedRequestCount = isLedgerLive
    ? MAX_REQUESTS_COUNT_LEDGER_LIMIT
    : MAX_REQUESTS_COUNT;
  const defaultSelectedRequestCount = Math.min(
    DEFAULT_CLAIM_REQUEST_SELECTED,
    maxSelectedRequestCount,
  );

  const maxSelectedCountReason = isLedgerLive
    ? 'Ledger Clear Sign allows to claim up to 2 requests per transaction'
    : null;

  return {
    maxSelectedRequestCount,
    defaultSelectedRequestCount,
    maxSelectedCountReason,
  };
};
