import {
  MAX_REQUESTS_COUNT_LEDGER_LIMIT,
  MAX_REQUESTS_COUNT,
} from 'features/withdrawals/withdrawals-constants';
import { useMemo } from 'react';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { RequestFormDataType, RequestFormValidationContextType } from './types';
import { useWeb3 } from 'reef-knot/web3-react';

// Prepares validation context object from request form data
export const useValidationContext = (
  requestData: RequestFormDataType,
  setIntermediateValidationResults: RequestFormValidationContextType['setIntermediateValidationResults'],
) => {
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
    if (!active)
      return {
        setIntermediateValidationResults,
        active,
      };
    const validationContextObject =
      balanceSteth &&
      balanceWSteth &&
      maxAmountPerRequestSteth &&
      maxAmountPerRequestWSteth &&
      minUnstakeSteth &&
      minUnstakeWSteth &&
      stethTotalSupply
        ? {
            active,
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
    active,
  ]);

  return useAwaiter<RequestFormValidationContextType>(context);
};
