import type { GGVWithdrawalRequestsResponse } from './hooks/use-ggv-withdrawal-requests';

export type { GGVWithdrawalRequestsResponse } from './hooks/use-ggv-withdrawal-requests';

export type GGVWithdrawalRequest =
  GGVWithdrawalRequestsResponse['openRequests'][number];

type Cancellation = {
  block_number: string;
  timestamp: string;
  transaction_hash: string;
};

type Fulfillment = {
  block_number: string;
  timestamp: string;
  transaction_hash: string;
};

type RequestMetadata = {
  amountOfAssets: string;
  amountOfShares: string;
  assetOut: string;
  creationTime: string;
  nonce: string;
  secondsToDeadline: string;
  secondsToMaturity: string;
  user: string;
};

type Request = {
  amount: string;
  blockNumber: string;
  metadata: RequestMetadata;
  offerToken: string;
  timestamp: string;
  transaction_hash: string;
  user: string;
  wantToken: string;
  wantTokenDecimals: string;
  wantTokenSymbol: string;
};

export type WQApiResponse = {
  Response: {
    cancelled_requests: {
      Cancellation: Cancellation;
      Request: Request;
    }[];
    expired_requests: Request[];
    fulfilled_requests: {
      Fulfillment: Fulfillment;
      Request: Request;
    }[];
    open_requests: Request[];
  };
};

export type GGVWithdrawalFormValues = {
  amount: bigint | null;
};

export type GGVWithdrawalFormValidatedValues = {
  amount: bigint;
};

export type GGVWithdrawalFormValidationContext = {
  isWalletActive: boolean;
  asyncContext: Promise<GGVWithdrawalFormAsyncValidationContext>;
};

export type GGVWithdrawalFormAsyncValidationContext = {
  balance: bigint;
  maxWithdrawal: bigint | null;
  minWithdrawal: bigint;
};

export type GGVWithdrawStoppedReason =
  | 'paused'
  | 'withdrawal-stopped'
  | 'withdrawal-zero-capacity'
  | 'transfer-from-shares-blocked'
  | 'transfer-from-shares-time-locked'
  | null;

export type GGVWithdrawalState = {
  isLoading: boolean;
  canWithdraw: boolean;
  reason: GGVWithdrawStoppedReason;
  unlockTime?: Date;
};

export type GGVWithdrawalFormDataContextValue = GGVWithdrawalState & {
  minDiscount?: number;
  hasActiveRequests: boolean;
};
