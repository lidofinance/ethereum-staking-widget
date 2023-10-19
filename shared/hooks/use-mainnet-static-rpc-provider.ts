import { getStaticRpcBatchProvider } from '@lido-sdk/providers';
import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';

import { useRpcUrl } from 'config';

export const useMainnetStaticRpcProvider = (): StaticJsonRpcBatchProvider => {
  const rpcUrl = useRpcUrl();

  return getStaticRpcBatchProvider(1, rpcUrl);
};
