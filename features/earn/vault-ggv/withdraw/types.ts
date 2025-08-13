type Cancellation = {
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
    fulfilled_requests: Request[];
    open_requests: Request[];
  };
};

export type GGVWithdrawalFormValues = {
  amount: bigint | null;
};

export type GGVWithdrawalFormValidatedValues = {
  amount: bigint;
};
