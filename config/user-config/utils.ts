// Not use absolute import here!
// code'''
//    import { getConfig } from 'config';
// '''
import { getConfig } from '../get-config';
import { UserConfigDefaultType } from './types';

const {
  defaultChain,
  supportedChains,
  prefillUnsafeElRpcUrls1,
  prefillUnsafeElRpcUrls5,
  prefillUnsafeElRpcUrls17000,
  walletconnectProjectId,
} = getConfig();

import { CHAINS } from 'consts/chains';

export const getUserConfigDefault = (): UserConfigDefaultType => {
  return {
    defaultChain: Number(defaultChain),
    supportedChainIds: supportedChains,
    prefillUnsafeElRpcUrls: {
      [CHAINS.Mainnet]: prefillUnsafeElRpcUrls1,
      [CHAINS.Goerli]: prefillUnsafeElRpcUrls5,
      [CHAINS.Holesky]: prefillUnsafeElRpcUrls17000,
    },
    walletconnectProjectId: walletconnectProjectId,
  };
};
