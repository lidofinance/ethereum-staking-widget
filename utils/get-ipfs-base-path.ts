import memoize from 'lodash/memoize';

import { config } from 'config';

export const getIpfsBasePath = memoize(() => {
  let basePath = document.querySelector('base')?.href || '/';
  if (basePath[basePath.length - 1] !== '/') basePath += '/';
  return basePath;
});

export const prefixUrl = (url: string, query?: Record<string, string>) => {
  // URLSearchParams encodes values once; a second encoding breaks `a,b` values
  const search = new URLSearchParams(query).toString();
  const queryString = search ? `?${search}` : '';

  if (config.ipfsMode) return `${getIpfsBasePath()}${queryString}#${url}`;
  return url;
};
