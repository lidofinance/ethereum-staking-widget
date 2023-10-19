import { EnvConfigRaw, EnvConfigParsed } from 'config/types';

export const parseEnvConfig = (envConfig: EnvConfigRaw): EnvConfigParsed => {
  return {
    defaultChain: Number(envConfig.defaultChain),
    supportedChainIds: envConfig.supportedChains,
    settingsPrefillRpc: envConfig.settingsPrefillRpc,
    ipfsMode: envConfig.ipfsMode,
    walletconnectProjectId: envConfig.walletconnectProjectId,
  };
};
