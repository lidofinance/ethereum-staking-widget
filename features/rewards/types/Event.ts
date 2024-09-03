import { LidoTransfer, TotalReward } from '.';

export type SubgraphData = LidoTransfer | TotalReward;

export type AdditionalData = {
  type: string;
  change: string;
  currencyChange?: string;
  apr?: string;
  balance: string;
  direction?: string;
  epochDays?: string;
  epochFullDays?: string;
  rewards?: string;
  reportShares?: string;
};

export type Event = SubgraphData & AdditionalData;
