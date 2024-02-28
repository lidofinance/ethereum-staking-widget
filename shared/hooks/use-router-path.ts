import { useRouter } from 'next/router';

import { getConfig } from 'config';
const { ipfsMode, isClientSide } = getConfig();

import { HOME_PATH } from 'consts/urls';

export const useRouterPath = () => {
  const router = useRouter();

  if (ipfsMode) {
    if (!isClientSide) return HOME_PATH;
    return location.hash.replace('#', '') || HOME_PATH;
  }

  // We can't' use `router.pathname` and `router.route` 'cause it's a mapping with file structure
  // example:
  // - /wrap                  --->  /wrap/[[...mode]]
  // - /withdrawals/request/  --->  /withdrawals/[mode]
  // also we need to remove last character because `router.asPath` contain `/` as last character
  // example:
  // - /wrap                  ---> - /wrap/
  // - <empty>                ---> - /
  if (router.asPath.length > 1 && router.asPath.slice(-1) === '/')
    return router.asPath.slice(0, -1);
  // Fix for index page - '/'
  else return router.asPath;
};
