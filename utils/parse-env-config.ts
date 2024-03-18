import { EnvConfigRaw, EnvConfigParsed } from 'config/types';
import { CHAINS } from 'utils/chains';

export const parseEnvConfig = (envConfig: EnvConfigRaw): EnvConfigParsed => {
  return {
    defaultChain: Number(envConfig.defaultChain),
    supportedChainIds: envConfig.supportedChains,
    prefillUnsafeElRpcUrls: {
      [CHAINS.Mainnet]: envConfig.prefillUnsafeElRpcUrls1,
      [CHAINS.Goerli]: envConfig.prefillUnsafeElRpcUrls5,
      [CHAINS.Holesky]: envConfig.prefillUnsafeElRpcUrls17000,
    },
    ipfsMode: envConfig.ipfsMode,
    walletconnectProjectId: envConfig.walletconnectProjectId,
  };
};
