import { getStaticRpcBatchProvider } from '@lido-sdk/providers';

import { dynamics, getBackendRPCPath } from 'config';

const rpc = getBackendRPCPath(dynamics.defaultChain);

export const resolveEns = async (name: string | Promise<string>) => {
  const provider = getStaticRpcBatchProvider(dynamics.defaultChain, rpc);
  return await provider.resolveName(name);
};
