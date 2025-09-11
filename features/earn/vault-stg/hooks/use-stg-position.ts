import { useQuery } from '@tanstack/react-query';

// Minimal placeholder position hook for STG; returns no data until implemented.
export const useSTGPosition = () => {
  const query = useQuery({
    queryKey: ['stg', 'position'],
    queryFn: async () => ({ sharesBalance: undefined, wethBalance: undefined }),
    enabled: false,
  });

  return {
    ...query,
    usdQuery: { isLoading: false },
    ggvTokenAddress: undefined,
    sharesBalance: undefined,
    wethBalance: undefined,
    usdBalance: undefined,
  };
};
