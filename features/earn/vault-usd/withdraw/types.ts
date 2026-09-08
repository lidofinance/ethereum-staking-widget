import type { WithdrawRequestData } from 'modules/mellow-meta-vaults/types/withdraw-request-data';

import type { UsdWithdrawToken } from '../types';

// A withdraw request tagged with the queue (payout token) it came from,
// so the UI can render the right icon and claiming can target the right queue.
export type UsdVaultWithdrawRequest = WithdrawRequestData & {
  token: UsdWithdrawToken;
};
