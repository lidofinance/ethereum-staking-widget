import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const { basePath } = serverRuntimeConfig;

export const prependBasePath = (route: string): string => {
  return `${basePath ?? ''}/${route}`;
};
