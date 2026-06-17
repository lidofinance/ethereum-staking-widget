// Don't use absolute import here!
// code'''
//    import { config } from 'config';
// '''
// otherwise you will get something like a cyclic error!
import { config } from '../get-config';
import { UserConfigDefaultType } from './types';

import { CHAINS } from 'consts/chains';

const KNOWN_CHAIN_IDS = new Set<number>(
  Object.values(CHAINS).filter((v): v is number => typeof v === 'number'),
);

export const getUserConfigDefault = (): UserConfigDefaultType => {
  return {
    defaultChain: Number(config.defaultChain),
    supportedChainIds: config.supportedChains.filter((id) =>
      KNOWN_CHAIN_IDS.has(id),
    ),
    prefillUnsafeElRpcUrls: {
      [CHAINS.Mainnet]: config.prefillUnsafeElRpcUrls1,
      [CHAINS.Holesky]: config.prefillUnsafeElRpcUrls17000,
      [CHAINS.Hoodi]: config.prefillUnsafeElRpcUrls560048,
      [CHAINS.Sepolia]: config.prefillUnsafeElRpcUrls11155111,
      [CHAINS.Optimism]: config.prefillUnsafeElRpcUrls10,
      [CHAINS.OptimismSepolia]: config.prefillUnsafeElRpcUrls11155420,
      [CHAINS.Unichain]: config.prefillUnsafeElRpcUrls130,
      [CHAINS.UnichainSepolia]: config.prefillUnsafeElRpcUrls1301,
    },
    walletconnectProjectId: config.walletconnectProjectId,
  };
};
