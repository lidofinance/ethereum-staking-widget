import type { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';

export type DVVDepositTokens = (typeof LIDO_TOKENS)['eth'] | 'wETH';

export type DVVDepositFormValues = {
  amount: bigint | null;
  token: DVVDepositTokens;
  referral: string | null;
};

export type DVVDepositFormValidatedValues = {
  amount: bigint;
  token: DVVDepositTokens;
  referral: string | null;
};

export type DVVDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<DVVDepositFormAsyncValidationContext>;
};

export type DVVDepositFormAsyncValidationContext = {
  [key in DVVDepositTokens]: {
    balance: bigint;
    // null for unlimited deposits
    maxDeposit: bigint | null;
  };
};

export type DVVDepositLimitReason =
  | 'non-whitelisted'
  | 'deposit-paused'
  | 'deposit-limit-reached';

export type DVVDepositFormContext = {
  maxAmount?: bigint;
  token: DVVDepositTokens;
  isLoading: boolean;
};
