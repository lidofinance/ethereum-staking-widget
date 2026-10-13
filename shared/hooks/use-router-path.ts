import { useLocation } from 'react-router';

export const useRouterPath = () => {
  const { pathname, search } = useLocation();
  const path = `${pathname}${search}`;

  // Both router modes resolve into location.pathname (createHashRouter
  // included — the fragment never reaches location), so no IPFS special case.
  // Trailing-slash strip is defensive: only a manually typed URL carries one.
  if (path.length > 1 && path.slice(-1) === '/') return path.slice(0, -1);
  return path;
};
