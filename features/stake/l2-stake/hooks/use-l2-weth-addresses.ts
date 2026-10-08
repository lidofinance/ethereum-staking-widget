import { getContractAddress } from 'config/networks/contract-address';
import { CONTRACT_NAMES } from 'config/networks/networks-map';
import { getTokenAddress } from 'config/networks/token-address';
import { TOKEN_SYMBOLS } from 'consts/tokens';
import { useLidoSDKL2 } from 'modules/web3';

// WETH staking needs both the token and the receiver it is approved to
export const useL2WethAddresses = () => {
  const { chainId } = useLidoSDKL2();
  const wethAddress = getTokenAddress(chainId, TOKEN_SYMBOLS.weth);
  const receiverAddress = getContractAddress(
    chainId,
    CONTRACT_NAMES.L2stakingReceiver,
  );
  return {
    wethAddress,
    receiverAddress,
    isWethSupported: !!(wethAddress && receiverAddress),
  };
};
