import { default as dynamics } from './dynamics';

// Everything else through config/dynamics.ts
const publicRuntimeConfig = {
  // BASE_URL is Vite's resolved `base` (from BASE_PATH in vite.config.ts);
  basePath: import.meta.env.BASE_URL.replace(/\/+$/, '') || undefined,
  developmentMode: import.meta.env.DEV,
};

export type PreConfigType = {
  BASE_PATH_ASSET: string;
} & typeof publicRuntimeConfig &
  typeof dynamics;

// `getPreConfig()` needs for internal using in 'config/groups/*'
// Do not use `getPreConfig()` outside of 'config/groups/*'
export const getPreConfig = (): PreConfigType => {
  const BASE_PATH_ASSET = dynamics.ipfsMode
    ? '.'
    : (publicRuntimeConfig.basePath ?? '');

  return {
    BASE_PATH_ASSET,
    ...publicRuntimeConfig,
    ...dynamics,
  };
};

// `preConfig` needs for external internal in 'config/groups/*'
// Not use `preConfig` outside of 'config/groups/*'
export const preConfig = getPreConfig();
