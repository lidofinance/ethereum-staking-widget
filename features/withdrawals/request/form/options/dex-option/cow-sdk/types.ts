import type { Address } from 'viem';

// CoW Protocol REST API types — no external dependencies

export type TokenInfo = {
  symbol: string;
  address: Address;
  decimals: number;
  chainId: number;
};

// POST /api/v1/quote
export type CowQuoteRequest = {
  sellToken: string;
  buyToken: string;
  from: string;
  receiver: string;
  sellAmountBeforeFee: string;
  kind: 'sell' | 'buy';
  partiallyFillable: boolean;
  appData: string;
  appDataHash: string;
  signingScheme: 'eip712';
};

export type CowQuoteResponse = {
  quote: {
    sellToken: string;
    buyToken: string;
    receiver: string;
    sellAmount: string;
    buyAmount: string;
    feeAmount: string;
    validTo: number;
    appData: string;
    kind: 'sell' | 'buy';
    partiallyFillable: boolean;
    sellTokenBalance: string;
    buyTokenBalance: string;
  };
  from: string;
  expiration: string;
  id: number;
  verified: boolean;
};

// POST /api/v1/orders
export type CowOrderRequest = {
  sellToken: string;
  buyToken: string;
  receiver: string;
  sellAmount: string;
  buyAmount: string;
  feeAmount: string;
  validTo: number;
  appData: string;
  kind: 'sell' | 'buy';
  partiallyFillable: boolean;
  sellTokenBalance: string;
  buyTokenBalance: string;
  signingScheme: 'eip712';
  signature: string;
  from: string;
};

// GET /api/v1/orders/{uid}
export type CowOrderResponse = {
  uid: string;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  feeAmount: string;
  status: CowOrderStatus;
  executedSellAmount?: string;
  executedBuyAmount?: string;
  creationDate: string;
  validTo: number;
};

export type CowOrderStatus =
  | 'open'
  | 'fulfilled'
  | 'expired'
  | 'cancelled'
  | 'presignaturePending';

// CoW API error shape
export type CowApiError = {
  errorType: string;
  description: string;
};
