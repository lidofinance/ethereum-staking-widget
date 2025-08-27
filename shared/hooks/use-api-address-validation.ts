import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { API_ROUTES } from 'consts/api';
import { config } from 'config';

export const useApiAddressValidation = () => {
  const { address } = useAccount();

  const currentValidationQueryResult = useQuery<{ isValid: boolean }>({
    queryKey: ['address-validation', address],
    ...STRATEGY_LAZY,
    enabled:
      !!address && config.addressApiValidationEnabled && !config.ipfsMode,
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
