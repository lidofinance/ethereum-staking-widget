export type EnvConfigRaw = {
  defaultChain: string | number;
  supportedChains: number[];
  settingsPrefillRpc: string;
  ipfsMode: boolean;
  walletconnectProjectId: string;
};

export type EnvConfigParsed = {
  defaultChain: number;
  supportedChainIds: number[];
  settingsPrefillRpc?: string;
  ipfsMode: boolean;
  walletconnectProjectId: string;
};
