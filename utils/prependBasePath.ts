import { config } from 'config';

export const prependBasePath = (route: string): string => {
  return `${config.basePath ?? ''}/${route}`;
};
