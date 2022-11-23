export type LidoTransfer = {
  id: string;

  from: string;
  to: string;
  value: string;

  shares: string;
  sharesBeforeDecrease: string;
  sharesAfterDecrease: string;
  sharesBeforeIncrease: string;
  sharesAfterIncrease: string;

  totalPooledEther: string;
  totalShares: string;

  balanceAfterDecrease: string;
  balanceAfterIncrease: string;

  mintWithoutSubmission: string;

  block: string;
  blockTime: string;
  transactionHash: string;
  transactionIndex: string;
  logIndex: string;
  transactionLogIndex: string;
};
