import { CHAINS } from 'consts/chains';

export type UserConfigDefaultType = {
  defaultChain: number;
  supportedChainIds: number[];
  prefillUnsafeElRpcUrls: {
    [CHAINS.Mainnet]: string[];
    [CHAINS.Holesky]: string[];
    [CHAINS.Sepolia]: string[];
  };
  walletconnectProjectId: string | undefined;
};
