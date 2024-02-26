// import { UserConfigDefaultType } from 'config/user-config/types'; // TODO: or better use 'config/user-config/types'?
import { getConfig, UserConfigDefaultType } from 'config';
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
