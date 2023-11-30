import { CHAINS } from 'utils/chains';

export type EnvConfigRaw = {
  defaultChain: string | number;
  supportedChains: number[];
  prefillUnsafeElRpcUrls1: string[];
  prefillUnsafeElRpcUrls5: string[];
  prefillUnsafeElRpcUrls17000: string[];
  ipfsMode: boolean;
  walletconnectProjectId: string;
};

export type EnvConfigParsed = {
  defaultChain: number;
  supportedChainIds: number[];
  prefillUnsafeElRpcUrls: {
    [CHAINS.Mainnet]: string[];
    [CHAINS.Goerli]: string[];
    [CHAINS.Holesky]: string[];
  };
  ipfsMode: boolean;
  walletconnectProjectId: string;
};
