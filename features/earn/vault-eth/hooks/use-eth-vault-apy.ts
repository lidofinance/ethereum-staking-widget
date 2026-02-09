import { useQuery } from '@tanstack/react-query';

export const useETHVaultApy = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['earn', 'eth', 'apy'],
    queryFn: () => 0,
  });

  return { apy: data, isLoading } as const;
};
