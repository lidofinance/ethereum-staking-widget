export const compareWithRouterPathInInfra = (asPath: string, href: string) => {
  // '/wrap/?ref=123#dsfdsf' ---> '/wrap/'
  const pathWithoutQueryString = asPath.split('?')[0];

  // '/wrap/' ---> '/wrap'
  const pathWithoutLastSlash =
    pathWithoutQueryString.slice(-1) === '/'
      ? pathWithoutQueryString.slice(0, -1)
      : pathWithoutQueryString;

  return pathWithoutLastSlash === href;
};

export const compareWithRouterPathInIPFS = (asPath: string, href: string) => {
  // createHashRouter resolves the '#/route' fragment into location.pathname,
  // so asPath ('/wrap?ref=123') never contains '#' — the legacy
  // `split('#')[1]` always returned undefined and no tab ever highlighted.
  return compareWithRouterPathInInfra(asPath, href);
};
