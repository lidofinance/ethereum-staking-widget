import {
  RequestStatusClaimable,
  RequestStatusesUnion,
} from 'features/withdrawals/types/request-status';

export type ClaimFormValidationContext = {
  maxSelectedRequestCount: number;
};

export type ClaimFormInputType = {
  requests: {
    checked: boolean;
    token_id: string;
    status: RequestStatusesUnion;
  }[];
  selectedTokens: RequestStatusClaimable[];
};
