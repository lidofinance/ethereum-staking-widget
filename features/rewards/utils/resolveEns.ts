import getConfig from 'next/config';
import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { getBackendRPCPath } from 'config';

const { publicRuntimeConfig } = getConfig();
const { defaultChain } = publicRuntimeConfig;

const rpc = getBackendRPCPath(defaultChain);

export const resolveEns = async (name: string | Promise<string>) => {
  const provider = getStaticRpcBatchProvider(defaultChain, rpc);
  return await provider.resolveName(name);
};
