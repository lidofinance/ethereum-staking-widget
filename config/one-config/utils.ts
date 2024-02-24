import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();

import { default as dynamics } from './dynamics';

// TODO: add return type
export const getOneConfig = () => {
  const isClientSide = typeof window !== 'undefined';
  const isServerSide = typeof window === 'undefined';

  return {
    isClientSide,
    isServerSide,
    // ...dynamics,
    ...(typeof window !== 'undefined' ? window.__env__ : dynamics),
    // ...serverRuntimeConfig,
    ...(isServerSide && serverRuntimeConfig && { env: process.env }),
  };
};
