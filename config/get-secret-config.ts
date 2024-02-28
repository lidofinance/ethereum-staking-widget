import getConfigNext from 'next/config';

const { serverRuntimeConfig } = getConfigNext();

export type SecretConfigType = typeof serverRuntimeConfig;

// 'getSecretConfig()' needs for backend side.
// We can't merge with 'getPreConfig()' because we want to split responsibility
//
// Also you can note that 'getSecretConfig' is just proxy for 'serverRuntimeConfig'
// because we want similar approach with 'getConfig'
export const getSecretConfig = (): SecretConfigType => {
  return serverRuntimeConfig;
};

export const secretConfig = getSecretConfig();
