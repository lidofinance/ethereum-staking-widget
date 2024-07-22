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
    },
    walletconnectProjectId: config.walletconnectProjectId,
  };
};
