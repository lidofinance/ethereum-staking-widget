import { z } from 'zod';
import type { GGVWithdrawalRequestsResponse } from './hooks/use-ggv-withdrawal-requests';
import { ADDRESS_SCHEMA, BIGINT_STRING_SCHEMA, HASH_SCHEMA } from 'utils/zod';

export type { GGVWithdrawalRequestsResponse } from './hooks/use-ggv-withdrawal-requests';

export type GGVWithdrawalRequest =
  GGVWithdrawalRequestsResponse['openRequests'][number];

// SevenSeas boring queue API. Numeric strings go through BigInt/Number in the
// hook, addresses through isAddressEqual — validate them before they get there
const QUEUE_EVENT_SCHEMA = z.object({
  block_number: BIGINT_STRING_SCHEMA,
  timestamp: BIGINT_STRING_SCHEMA,
  transaction_hash: HASH_SCHEMA,
});

const REQUEST_SCHEMA = z.looseObject({
  amount: BIGINT_STRING_SCHEMA,
  blockNumber: BIGINT_STRING_SCHEMA,
  offerToken: ADDRESS_SCHEMA,
  timestamp: BIGINT_STRING_SCHEMA,
  transaction_hash: HASH_SCHEMA,
  user: ADDRESS_SCHEMA,
  wantToken: ADDRESS_SCHEMA,
  wantTokenDecimals: BIGINT_STRING_SCHEMA,
  wantTokenSymbol: z.string(),
  metadata: z.looseObject({
    amountOfAssets: BIGINT_STRING_SCHEMA,
    amountOfShares: BIGINT_STRING_SCHEMA,
    assetOut: ADDRESS_SCHEMA,
    creationTime: BIGINT_STRING_SCHEMA,
    nonce: BIGINT_STRING_SCHEMA,
    secondsToDeadline: BIGINT_STRING_SCHEMA,
    secondsToMaturity: BIGINT_STRING_SCHEMA,
    user: ADDRESS_SCHEMA,
  }),
});

export const WQ_API_RESPONSE_SCHEMA = z.object({
  Response: z.object({
    cancelled_requests: z.array(
      z.object({ Cancellation: QUEUE_EVENT_SCHEMA, Request: REQUEST_SCHEMA }),
    ),
    expired_requests: z.array(REQUEST_SCHEMA),
    fulfilled_requests: z.array(
      z.object({ Fulfillment: QUEUE_EVENT_SCHEMA, Request: REQUEST_SCHEMA }),
    ),
    open_requests: z.array(REQUEST_SCHEMA),
  }),
});

export type WQApiResponse = z.infer<typeof WQ_API_RESPONSE_SCHEMA>;

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
