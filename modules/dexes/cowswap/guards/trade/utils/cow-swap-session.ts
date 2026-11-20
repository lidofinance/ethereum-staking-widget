import { ethAddress, isAddressEqual } from 'viem';

import type { ApprovalData, OrderData } from '../../tx';

import type { TokenDecimalsMap, ValidatedTradeSnapshot } from './verify-order';
import {
  approvalSnapshotFromTrade,
  verifyApprovalAgainstSnapshot,
  verifyOrderAgainstSnapshot,
  type ValidatedApprovalSnapshot,
} from './evaluate-trade';

// One widget provider's lifetime. Revoking it drops the validated trade and
// approval and ends the provider's access to the wallet
export type CowSwapSession = {
  isActive: () => boolean;
  revoke: () => void;
  // ignored once revoked
  storeTrade: (snapshot: ValidatedTradeSnapshot | null) => void;
  storeApproval: (snapshot: ValidatedApprovalSnapshot | null) => void;
  // error message, or null when the request matches what was validated
  verifyApproval: (approval: ApprovalData) => string | null;
  consumeSignedOrder: (order: OrderData) => string | null;
};

/**
 * The validated trade and approval of one widget provider. A validation that
 * outlives the session writes into it and is dropped, so no caller has to
 * compare generations.
 */
export const createCowSwapSession = (
  tokenDecimals: TokenDecimalsMap,
): CowSwapSession => {
  let isActive = true;
  let trade: ValidatedTradeSnapshot | null = null;
  let approval: ValidatedApprovalSnapshot | null = null;

  return {
    isActive: () => isActive,
    revoke: () => {
      isActive = false;
      trade = null;
      approval = null;
    },
    storeTrade: (snapshot) => {
      if (isActive) trade = snapshot;
    },
    storeApproval: (snapshot) => {
      if (isActive) approval = snapshot;
    },
    verifyApproval: (data: ApprovalData) =>
      verifyApprovalAgainstSnapshot(data, [
        approval,
        approvalSnapshotFromTrade(trade, tokenDecimals),
      ]),
    consumeSignedOrder: (order: OrderData) => {
      const error = verifyOrderAgainstSnapshot(order, trade, tokenDecimals);
      // EthFlow sends ETH with the order: one transaction per validated trade
      if (!error && isAddressEqual(order.sellToken, ethAddress)) trade = null;
      return error;
    },
  };
};
