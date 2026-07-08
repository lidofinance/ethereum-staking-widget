import { useQuery } from '@tanstack/react-query';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { DEX_SELL_TOKEN_LIST_URL } from '../consts';

export const useIsGhAvailable = () => {
  const { data: isGithubAvailable = true } = useQuery({
    queryKey: ['dex-token-list-availability'],
    ...STRATEGY_IMMUTABLE,
    placeholderData: true,
    queryFn: () =>
      fetch(DEX_SELL_TOKEN_LIST_URL, { method: 'HEAD' })
        .then((res) => res.ok)
        .catch(() => false),
  });

  return isGithubAvailable;
};
