import { getOneConfig } from 'config/one-config/utils';
const { basePath } = getOneConfig();

export const prependBasePath = (route: string): string => {
  return `${basePath ?? ''}/${route}`;
};
