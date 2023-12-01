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
  // '/?ref=123&embed=456&app=789#/wrap' ---> '/wrap'
  return asPath.split('#')[1] === href;
};
