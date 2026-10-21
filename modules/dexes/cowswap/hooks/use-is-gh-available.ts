import { useQuery } from '@tanstack/react-query';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';

export const useIsGhAvailable = (list: string) => {
  const { data: isGithubAvailable = true } = useQuery({
    queryKey: ['dex-token-list-availability', list],
    ...STRATEGY_IMMUTABLE,
    placeholderData: true,
    queryFn: () =>
      fetch(list, { method: 'HEAD' })
        .then((res) => res.ok)
        .catch(() => false),
  });

  return isGithubAvailable;
};
