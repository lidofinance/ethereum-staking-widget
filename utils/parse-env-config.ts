import { EnvConfigRaw, EnvConfigParsed } from 'config/types';

export const parseEnvConfig = (envConfig: EnvConfigRaw): EnvConfigParsed => {
  return {
    defaultChain: Number(envConfig.defaultChain),
    supportedChainIds: envConfig.supportedChains,
    prefillUnsafeElRpcUrls: envConfig.prefillUnsafeElRpcUrls,
    ipfsMode: envConfig.ipfsMode,
    walletconnectProjectId: envConfig.walletconnectProjectId,
  };
};
