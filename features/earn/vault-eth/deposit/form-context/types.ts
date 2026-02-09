import { ETH_DEPOSABLE_TOKENS } from '../../consts';

export type ETH_DEPOSIT_TOKENS = (typeof ETH_DEPOSABLE_TOKENS)[number];

export type ETHDepositFormValues = {
  amount: null | bigint;
  token: ETH_DEPOSIT_TOKENS;
  referral: string | null;
};

export type ETHDepositFormValidatedValues = {
  amount: bigint;
  token: ETH_DEPOSIT_TOKENS;
  referral: string | null;
};

export type ETHDepositFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<ETHDepositFormAsyncValidationContext>;
};

export type ETHDepositFormAsyncValidationContext = {
  [key in ETH_DEPOSIT_TOKENS]: {
    balance: bigint;
  };
};

export type ETHDepositFormDataContextValue = {
  maxAmount?: bigint;
  isLoading: boolean;
  token: ETH_DEPOSIT_TOKENS;
  isDepositLockedForCurrentToken: boolean;
};
