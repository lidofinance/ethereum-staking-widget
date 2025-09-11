import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type STG_DEPOSIT_TOKENS =
  | (typeof LIDO_TOKENS)['eth']
  | (typeof LIDO_TOKENS)['wsteth']
  | 'wETH';

export type STGDepositFormValues = {
  amount: null | bigint;
  token: STG_DEPOSIT_TOKENS;
};
