import type { CHAIN_ID } from 'consts/chains';

export type UserConfigDefaultType = {
  defaultChain: number;
  supportedChainIds: number[];
  prefillUnsafeElRpcUrls: {
    [chainId in CHAIN_ID]: string[];
  };
  walletconnectProjectId: string | undefined;
};
