export type WithdrawRequestData = {
  // Timestamp when the redemption request was submitted.
  timestamp: bigint;
  // Amount of vault shares submitted for redemption.
  shares: bigint;
  // Whether the request has been processed and is now claimable.
  isClaimable: boolean;
  // Amount of assets that can be claimed by the user.
  assets: bigint;
};
