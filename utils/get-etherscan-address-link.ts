import { getEtherscanLink as getEtherscanLinkSDK } from '@lido-sdk/helpers';
import { CHAINS as CHAINS_SDK } from '@lido-sdk/constants';

import { CHAINS } from 'consts/chains';

export const getEtherscanAddressLink = (
  chainId: number,
  address: string,
  fallbackChainId: number,
): string => {
  if (chainId === CHAINS.OptimismSepolia) {
    return `https://sepolia-optimistic.etherscan.io/address/${address}`;
  } else if (chainId === CHAINS.Optimism) {
    return `https://optimistic.etherscan.io/address/${address}`;
  }

  try {
    return getEtherscanLinkSDK(chainId as CHAINS_SDK, address, 'address');
  } catch {
    return getEtherscanLinkSDK(
      fallbackChainId as CHAINS_SDK,
      address,
      'address',
    );
  }
};
