import { useRouter } from 'next/router';
import omitBy from 'lodash/omitBy';
import isEmpty from 'lodash/isEmpty';

export const useRoutes = () => {
  const router = useRouter();
  const { ref, embed } = router.query;

  const isClaimTab = router.query.tab === 'claim';
  const query = { ref: ref as string, embed: embed as string };
  const searchParam = new URLSearchParams(omitBy(query, isEmpty)).toString();
  const claimPath = `/withdrawals?tab=claim${
    searchParam ? `&${searchParam}` : ''
  }`;
  const requestPath = `/withdrawals${searchParam ? `?${searchParam}` : ''}`;

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

  return { isClaimTab, navRoutes, claimPath, requestPath };
};
