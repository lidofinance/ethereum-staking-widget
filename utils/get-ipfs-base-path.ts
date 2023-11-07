import memoize from 'lodash/memoize';
import { dynamics } from 'config';
import { encodeURLQuery } from './encodeURLQuery';

export const getIpfsBasePath = memoize(() => {
  let basePath = document.querySelector('base')?.href || '/';
  if (basePath[basePath.length - 1] !== '/') basePath += '/';
  return basePath;
});

export const prefixUrl = (url: string, query?: Record<string, string>) => {
  const queryString =
    query && Object.keys(query).length > 0 ? `?${encodeURLQuery(query)}` : '';

  if (dynamics.ipfsMode) return `${getIpfsBasePath()}${queryString}#${url}`;
  return url;
};
