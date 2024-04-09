import { CHAINS } from 'consts/chains';

export type UserConfigDefaultType = {
  defaultChain: number;
  supportedChainIds: number[];
  prefillUnsafeElRpcUrls: {
    [CHAINS.Mainnet]: string[];
    [CHAINS.Goerli]: string[];
    [CHAINS.Holesky]: string[];
  };
  walletconnectProjectId: string | undefined;
};
