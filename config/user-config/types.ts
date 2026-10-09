import { CHAINS } from 'consts/chains';

export type UserConfigDefaultType = {
  defaultChain: number;
  supportedChainIds: number[];
  prefillUnsafeElRpcUrls: {
    [key in CHAINS]: string[];
  };
  walletconnectProjectId: string | undefined;
};
