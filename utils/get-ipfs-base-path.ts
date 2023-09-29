import memoize from 'lodash/memoize';
import { dynamics } from 'config';

export const getIpfsBasePath = memoize(() => {
  let basePath = document.querySelector('base')?.href || '/';
  if (basePath[basePath.length - 1] !== '/') basePath += '/';
  return basePath;
});

export const prefixUrl = (url: string) => {
  if (dynamics.ipfsMode) return `${getIpfsBasePath()}#${url}`;
  return url;
};
