import { getConfig } from 'config';
const { basePath } = getConfig();

export const prependBasePath = (route: string): string => {
  return `${basePath ?? ''}/${route}`;
};
