import { default as dynamics } from './dynamics';

// Formerly `publicRuntimeConfig` from `next/config` (kept the same shape).
// Everything else always flowed through `window.__env__` / `config/client-env-manifest.ts`
// (see `config/dynamics.ts`).
const publicRuntimeConfig = {
  // BASE_URL is Vite's resolved `base` (from BASE_PATH in vite.config.ts);
  // '/' → '' matches the empty-basePath convention of the old Next config.
  basePath: import.meta.env.BASE_URL.replace(/\/+$/, '') || undefined,
  developmentMode: import.meta.env.DEV,
  // Metrics are collected by the Fastify api pod, never by the static web
  // bundle (the Next server used to host /api/metrics itself).
  collectMetrics: false,
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
