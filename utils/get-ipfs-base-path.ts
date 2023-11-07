import memoize from 'lodash/memoize';
import { dynamics } from 'config';

export const getIpfsBasePath = memoize(() => {
  let basePath = document.querySelector('base')?.href || '/';
  if (basePath[basePath.length - 1] !== '/') basePath += '/';
  return basePath;
});

export const prefixUrl = (url: string, query?: Record<string, string>) => {
  let queryString = '';
  if (query && Object.keys(query).length > 0) {
    queryString = `?${new URLSearchParams(query).toString()}`;
  }

  if (dynamics.ipfsMode) return `${getIpfsBasePath()}${queryString}#${url}`;
  return url;
};
