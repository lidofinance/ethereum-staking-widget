// Don't use absolute import here!
// code'''
//    import { config } from 'config';
// '''
// otherwise you will get something like a cyclic error!
import { config } from '../get-config';
import { UserConfigDefaultType } from './types';

import { CHAINS } from 'consts/chains';

export const getUserConfigDefault = (): UserConfigDefaultType => {
  return {
    defaultChain: Number(config.defaultChain),
    supportedChainIds: config.supportedChains,
    prefillUnsafeElRpcUrls: {
      [CHAINS.Mainnet]: config.prefillUnsafeElRpcUrls1,
      [CHAINS.Holesky]: config.prefillUnsafeElRpcUrls17000,
      [CHAINS.Hoodi]: config.prefillUnsafeElRpcUrls560048,
      [CHAINS.Sepolia]: config.prefillUnsafeElRpcUrls11155111,
      [CHAINS.Optimism]: config.prefillUnsafeElRpcUrls10,
      [CHAINS.OptimismSepolia]: config.prefillUnsafeElRpcUrls11155420,
      [CHAINS.Soneium]: config.prefillUnsafeElRpcUrls1868,
      [CHAINS.SoneiumMinato]: config.prefillUnsafeElRpcUrls1946,
      [CHAINS.Unichain]: config.prefillUnsafeElRpcUrls130,
      [CHAINS.UnichainSepolia]: config.prefillUnsafeElRpcUrls1301,
    },
    walletconnectProjectId: config.walletconnectProjectId,
  };
};
