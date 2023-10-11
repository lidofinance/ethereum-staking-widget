// eslint-disable-next-line import/no-extraneous-dependencies
import Axios, { CreateAxiosDefaults } from 'axios';
import { AXIOS_REQUEST_TIMEOUT_MS } from 'config';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata: any;
  }
}

export const _createAxios = (config?: CreateAxiosDefaults) => {
  return Axios.create({
    timeout: AXIOS_REQUEST_TIMEOUT_MS,
    ...(config ?? {}),
  });
};
