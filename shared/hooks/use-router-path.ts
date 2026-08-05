import { useRouter } from 'next/router';

export const useRouterPath = () => {
  const router = useRouter();

  // Both router modes resolve into location.pathname (createHashRouter
  // included — the fragment never reaches asPath), so no IPFS special case.
  // Trailing-slash strip is defensive: only a manually typed URL carries one.
  if (router.asPath.length > 1 && router.asPath.slice(-1) === '/')
    return router.asPath.slice(0, -1);
  return router.asPath;
};
