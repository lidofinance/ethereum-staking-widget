import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { API_ROUTES } from 'consts/api';
import { config } from 'config';

export const NO_SAFE_VERSION = 'NONE_AVAILABLE';

export const useApiAddressValidation = () => {
  const { address } = useAccount();

  const currentValidationQueryResult = useQuery<{ isValid: boolean }>({
    queryKey: ['address-validation', address],
    ...STRATEGY_LAZY,
    enabled: !!address && config.addressApiValidationEnabled,
    queryFn: async () => {
      const response = await fetch(
        `${API_ROUTES.VALIDATION}?address=${address}`,
        {
          method: 'GET',
        },
      );

      return response.json();
    },
  });

  return currentValidationQueryResult;
};
