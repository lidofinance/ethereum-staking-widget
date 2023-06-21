import { useSafeQueryString } from 'shared/hooks/useSafeQueryString';

export const useRoutes = () => {
  const qs = useSafeQueryString();
  const claimPath = `/withdrawals/claim${qs}`;
  const requestPath = `/withdrawals/request${qs}`;

  const navRoutes = [
    {
      path: requestPath,
      name: 'Request',
    },
    {
      path: claimPath,
      name: 'Claim',
    },
  ];

  return { navRoutes, claimPath, requestPath };
};
