import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { API_ROUTES } from 'consts/api';
import { useEffect } from 'react';
import { useUserConfig } from 'config/user-config';
import { useForceDisconnect } from 'reef-knot/core-react';

export const NO_SAFE_VERSION = 'NONE_AVAILABLE';

export const useAddressValidation = () => {
  const { setIsWalletConnectionAllowed } = useUserConfig();
  const { forceDisconnect } = useForceDisconnect();
  const { address } = useAccount();

  const currentValidationQueryResult = useQuery({
    queryKey: ['address-validation', address],
    ...STRATEGY_IMMUTABLE,
    enabled: !!address,
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

  // disconnect wallet and disallow connection for unsafe versions
  useEffect(() => {
    if (currentValidationQueryResult.data?.isValid === false) {
      forceDisconnect();
    }
  }, [
    currentValidationQueryResult.data?.isValid,
    forceDisconnect,
    setIsWalletConnectionAllowed,
  ]);

  return {
    get data() {
      return {
        isValid: currentValidationQueryResult.data?.isValid,
      };
    },
    get isLoading() {
      return currentValidationQueryResult.isLoading;
    },
    get isFetching() {
      return currentValidationQueryResult.isFetching;
    },
    get error() {
      return currentValidationQueryResult.error;
    },
  };
};
