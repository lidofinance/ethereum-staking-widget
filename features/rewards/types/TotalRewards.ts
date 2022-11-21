export type TotalReward = {
  id: string;

  totalPooledEtherBefore: string;
  totalPooledEtherAfter: string;
  totalSharesBefore: string;
  totalSharesAfter: string;

  block: string;
  blockTime: string;
  logIndex: string;
  transactionHash: string;
};
