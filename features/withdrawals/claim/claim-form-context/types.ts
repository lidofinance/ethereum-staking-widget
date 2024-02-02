import {
  RequestStatusClaimable,
  RequestStatusesUnion,
} from 'features/withdrawals/types/request-status';

export type ClaimFormValidationContext = {
  maxSelectedRequestCount: number;
  active: boolean;
};

export type ClaimFormInputType = {
  requests: {
    checked: boolean;
    token_id: string;
    status: RequestStatusesUnion;
  }[];
  selectedTokens: RequestStatusClaimable[];
};
