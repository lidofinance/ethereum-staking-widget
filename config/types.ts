export type EnvConfigRaw = {
  defaultChain: string;
  supportedChains: string;
  isMaintenanceMode: string;
  settingsPrefillRpc: string;
  ipfsMode: string;
  walletconnectProjectId: string;
};

export type EnvConfigParsed = {
  defaultChain: number;
  supportedChainIds: number[];
  isMaintenanceMode: boolean;
  settingsPrefillRpc?: string;
  ipfsMode: boolean;
  walletconnectProjectId: string;
};
