import { useRouter } from 'next/router';
import { getQueryParamsString } from 'utils';

export const useRoutes = () => {
  const router = useRouter();
  const { ref, embed } = router.query;
  const qs = getQueryParamsString(ref, embed);
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
