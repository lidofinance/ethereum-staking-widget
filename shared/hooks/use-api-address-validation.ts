import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { API_ROUTES } from 'consts/api';
import { config } from 'config';
import { standardFetcher } from 'utils/standardFetcher';

const getApiUrl = (route: string, params?: Record<string, string>) => {
  // Simple: always use full URL with current origin
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  let url = `${baseUrl}/${route}`;

  // Add query parameters
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  return url;
};

export const useApiAddressValidation = () => {
  const { address } = useAccount();

  const currentValidationQueryResult = useQuery<{ isValid: boolean }>({
    queryKey: ['address-validation', address],
    ...STRATEGY_LAZY,
    enabled:
      !!address && config.addressApiValidationEnabled && !config.ipfsMode,
    queryFn: async () => {
      const url = getApiUrl(API_ROUTES.VALIDATION, { address: address || '' });
      return await standardFetcher(url, {
        method: 'GET',
      });
    },
    retry: 1,
  });

  return currentValidationQueryResult;
};
