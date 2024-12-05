export type RequestStatus = {
  amountOfStETH: bigint;
  amountOfShares: bigint;
  owner: string;
  timestamp: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
  id: bigint;
  stringId: string;
  finalizationAt: string | null;
};

export type RequestStatusClaimable = RequestStatus & {
  hint: bigint;
  claimableEth: bigint;
};

export type RequestStatusPending = RequestStatus & {
  expectedEth: bigint;
};

export type RequestStatusesUnion =
  | RequestStatus
  | RequestStatusClaimable
  | RequestStatusPending;
