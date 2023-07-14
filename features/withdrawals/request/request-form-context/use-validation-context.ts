import {
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
  MAX_REQUESTS_COUNT,
} from 'features/withdrawals/withdrawals-constants';
import { useMemo } from 'react';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { RequestFormDataType, RequestFormValidationContextType } from './types';

// Prepares validation context object from request form data
export const useValidationContext = (
  requestData: RequestFormDataType,
  setIntermediateValidationResults: RequestFormValidationContextType['setIntermediateValidationResults'],
) => {
  const isLedgerLive = useIsLedgerLive();
  const maxRequestCount = isLedgerLive
    ? MAX_REQUESTS_COUNT_LEDGER_LIMIT
    : MAX_REQUESTS_COUNT;
  const {
    balanceSteth,
    balanceWSteth,
    maxAmountPerRequestSteth,
    maxAmountPerRequestWSteth,
    minUnstakeSteth,
    minUnstakeWSteth,

    stethTotalSupply,
  } = requestData;
  return useMemo(() => {
    const validationContextObject =
      balanceSteth &&
      balanceWSteth &&
      maxAmountPerRequestSteth &&
      maxAmountPerRequestWSteth &&
      minUnstakeSteth &&
      minUnstakeWSteth &&
      stethTotalSupply
        ? {
            balanceSteth,
            balanceWSteth,
            maxAmountPerRequestSteth,
            maxAmountPerRequestWSteth,
            minUnstakeSteth,
            minUnstakeWSteth,
            maxRequestCount,
            stethTotalSupply,
            setIntermediateValidationResults,
          }
        : undefined;
    return validationContextObject;
  }, [
    balanceSteth,
    balanceWSteth,
    maxAmountPerRequestSteth,
    maxAmountPerRequestWSteth,
    maxRequestCount,
    minUnstakeSteth,
    minUnstakeWSteth,
    setIntermediateValidationResults,
    stethTotalSupply,
  ]);
};
