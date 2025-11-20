import { useCallback } from 'react';
import { Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  const validateAddressAPI = useCallback(
    async (addressToValidate: Address) => {
      if (!config.addressApiValidationEnabled || config.ipfsMode) {
        return { isValid: true };
      }

      const result = await queryClient.fetchQuery<{ isValid: boolean } | null>({
        queryKey: ['address-validation-api', addressToValidate],
        queryFn: async () => {
          try {
            const url = getApiUrl(API_ROUTES.VALIDATION, {
              address: addressToValidate,
            });
            return await standardFetcher(url, {
              method: 'GET',
            });
          } catch (error) {
            return null;
          }
        },
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 1,
      });

      return result;
    },
    [queryClient],
  );

  return validateAddressAPI;
};
