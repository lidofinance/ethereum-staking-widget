import {
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
  MAX_REQUESTS_COUNT,
} from 'features/withdrawals/withdrawals-constants';
import { useMemo } from 'react';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import type {
  RequestFormDataType,
  RequestFormValidationAsyncContextType,
  RequestFormValidationContextType,
} from './types';
import { useWeb3 } from 'reef-knot/web3-react';

// Prepares validation context object from request form data
export const useValidationContext = (
  requestData: RequestFormDataType,
  setIntermediateValidationResults: RequestFormValidationContextType['setIntermediateValidationResults'],
): RequestFormValidationContextType => {
  const { active } = useWeb3();
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

  return { active, asyncContext, setIntermediateValidationResults };
};
