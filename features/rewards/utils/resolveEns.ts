import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

export const resolveEns = async (
  name: string | Promise<string>,
  provider: StaticJsonRpcBatchProvider,
) => {
  return await provider.resolveName(name);
};
