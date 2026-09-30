export type TotalReward = {
  id: string;

  totalPooledEtherBefore: string;
  totalPooledEtherAfter: string;
  totalSharesBefore: string;
  totalSharesAfter: string;

  block: string;
  blockTime: string;
  logIndex: string;
  // Oracle-report rewards are not tied to a user transaction
  transactionHash?: string;
};
