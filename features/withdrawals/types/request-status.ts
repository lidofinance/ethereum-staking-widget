import type { BigNumber } from 'ethers';

export type RequestStatus = {
  amountOfStETH: BigNumber;
  amountOfShares: BigNumber;
  owner: string;
  timestamp: BigNumber;
  isFinalized: boolean;
  isClaimed: boolean;
  id: BigNumber;
  stringId: string;
  finalizationAt: string | null;
};

export type RequestStatusClaimable = RequestStatus & {
  hint: BigNumber;
  claimableEth: BigNumber;
};

export type RequestStatusPending = RequestStatus & {
  expectedEth: BigNumber;
};

export type RequestStatusesUnion =
  | RequestStatus
  | RequestStatusClaimable
  | RequestStatusPending;
