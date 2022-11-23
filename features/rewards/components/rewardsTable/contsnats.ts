import { RewardsTableConfig } from './types';

export const REWARDS_TABLE_TEXT = {
  headers: {
    blockTime: 'Date',
    type: 'Type',
    change: 'Change',
    currencyChange: 'Change',
    apr: 'Apr',
    balance: 'Balance',
  },
};

export const REWARDS_TABLE_CONFIG: RewardsTableConfig = {
  columnsOrder: [
    {
      field: 'blockTime',
      name: REWARDS_TABLE_TEXT.headers.blockTime,
    },
    {
      field: 'type',
      name: REWARDS_TABLE_TEXT.headers.type,
    },
    {
      field: 'change',
      name: REWARDS_TABLE_TEXT.headers.change,
    },
    {
      field: 'currencyChange',
      name: REWARDS_TABLE_TEXT.headers.currencyChange,
    },
    {
      field: 'apr',
      name: REWARDS_TABLE_TEXT.headers.apr,
    },
    {
      field: 'balance',
      name: REWARDS_TABLE_TEXT.headers.balance,
    },
  ],
  columnsConfig: {},
  page: 1,
  take: 10,
};
