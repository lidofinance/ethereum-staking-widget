import { useMemo } from 'react';
import {
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
  MAX_REQUESTS_COUNT,
} from 'features/withdrawals/withdrawals-constants';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { useDappStatus } from 'modules/web3';
import type {
  RequestFormDataType,
  RequestFormValidationAsyncContextType,
  RequestFormValidationContextType,
} from './types';

// Prepares validation context object from request form data
export const useValidationContext = (
  requestData: RequestFormDataType,
  setIntermediateValidationResults: RequestFormValidationContextType['setIntermediateValidationResults'],
): RequestFormValidationContextType => {
  const { isDappActive } = useDappStatus();
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

  const context = useMemo(() => {
    const validationContextObject =
      balanceSteth !== undefined &&
      balanceWSteth !== undefined &&
      maxAmountPerRequestSteth !== undefined &&
      maxAmountPerRequestWSteth !== undefined &&
      minUnstakeSteth !== undefined &&
      minUnstakeWSteth !== undefined &&
      stethTotalSupply !== undefined
        ? {
            balanceSteth,
            balanceWSteth,
            maxAmountPerRequestSteth,
            maxAmountPerRequestWSteth,
            minUnstakeSteth,
            minUnstakeWSteth,
            maxRequestCount,
            stethTotalSupply,
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
    stethTotalSupply,
  ]);

  const asyncContext =
    useAwaiter<RequestFormValidationAsyncContextType>(context).awaiter;

  return {
    isWalletActive: isDappActive,
    asyncContext,
    setIntermediateValidationResults,
  };
};
