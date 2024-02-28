import getConfigNext from 'next/config';
import { default as dynamics } from './dynamics';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfigNext();

// TODO: type
// type PreConfigType = typeof publicRuntimeConfig & typeof serverRuntimeConfig & typeof dynamics;

// getPreConfig() needs for external internal in 'config/groups/*'
// Not use getPreConfig() outside of 'config/groups/*'
export const getPreConfig = (): any => {
  const BASE_PATH_ASSET = dynamics.ipfsMode
    ? '.'
    : serverRuntimeConfig.basePath || publicRuntimeConfig.basePath;

  return {
    BASE_PATH_ASSET,

    ...publicRuntimeConfig,

    ...(typeof window !== 'undefined' ? window.__env__ : dynamics),

    // TODO getServerConfig for secret envs?
    ...serverRuntimeConfig,
  };
};
