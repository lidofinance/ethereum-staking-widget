export const useRoutes = () => {
  const claimPath = `/withdrawals/claim`;
  const requestPath = `/withdrawals/request`;

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
