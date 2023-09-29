import { useRouter } from 'next/router';
import { isClientSide } from 'utils/isClientSide';
import { dynamics } from 'config';

export const useRouterPath = () => {
  const router = useRouter();

  if (dynamics.ipfsMode) {
    if (!isClientSide()) return '/';
    return location.hash.replace('#', '') || '/';
  }

  return router.pathname;
};
