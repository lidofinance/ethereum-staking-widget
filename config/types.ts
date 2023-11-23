export type EnvConfigRaw = {
  defaultChain: string | number;
  supportedChains: number[];
  prefillUnsafeElRpcUrls: string[];
  ipfsMode: boolean;
  walletconnectProjectId: string;
};

export type EnvConfigParsed = {
  defaultChain: number;
  supportedChainIds: number[];
  prefillUnsafeElRpcUrls: string[];
  ipfsMode: boolean;
  walletconnectProjectId: string;
};
