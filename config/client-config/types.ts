import { CHAINS } from 'utils/chains';

export type UserConfigDefaultType = {
  defaultChain: number;
  supportedChainIds: number[];
  prefillUnsafeElRpcUrls: {
    [CHAINS.Mainnet]: string[];
    [CHAINS.Goerli]: string[];
    [CHAINS.Holesky]: string[];
  };
  walletconnectProjectId: string;
};
