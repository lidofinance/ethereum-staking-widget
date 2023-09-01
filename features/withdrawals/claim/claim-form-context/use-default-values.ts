import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';
import { useCallback, useEffect, useMemo } from 'react';
import { useAwaiter } from 'shared/hooks/use-awaiter';
import { ClaimFormInputType } from './types';
import { WithdrawalRequests } from 'features/withdrawals/hooks';

export const generateDefaultValues = (
  data: WithdrawalRequests,
  defaultSelectedRequestCount: number,
): ClaimFormInputType => {
  const requests = [
    ...data.sortedClaimableRequests.map((request, index) => ({
      token_id: request.stringId,
      checked: index < defaultSelectedRequestCount,
      status: request,
    })),
    ...data.pendingRequests.map((request) => ({
      token_id: request.stringId,
      checked: false,
      status: request,
    })),
  ];

  return { requests, selectedTokens: [] };
};

/// provides values & defaultValues props to useForm
/// values keep requests list updated if added/removed and smartly merged with existing state
/// defaultValues provides async function, used by form to wait for data to load
export const useGetDefaultValues = (defaultSelectedRequestCount: number) => {
  const { data, error } = useClaimData();
  const values: ClaimFormInputType | undefined = useMemo(() => {
    if (!data) return undefined;
    return generateDefaultValues(data, defaultSelectedRequestCount);
  }, [defaultSelectedRequestCount, data]);

  const { awaiter, resolver } = useAwaiter(values);
  useEffect(() => {
    if (error && !resolver.isResolved) {
      resolver.resolve({ requests: [], selectedTokens: [] });
    }
  }, [resolver, error]);

  const getDefaultValues = useCallback(
    () => (values ? Promise.resolve(values) : awaiter),
    [awaiter, values],
  );

  return { getDefaultValues };
};
