import { getEtherscanTxLink as getEtherscanTxLinkSDK } from '@lido-sdk/helpers';
import { CHAINS as CHAINS_SDK } from '@lido-sdk/constants';

import { CHAINS } from 'consts/chains';

export const getEtherscanTxLink = (
  chainId: CHAINS | CHAINS_SDK,
  hash: string,
): string => {
  // TODO: use viem for getting explorer
  if (chainId === CHAINS.OptimismSepolia) {
    return `https://sepolia-optimistic.etherscan.io/tx/${hash}`;
  } else if (chainId === CHAINS.Optimism) {
    return `https://optimistic.etherscan.io/tx/${hash}`;
  }

  return getEtherscanTxLinkSDK(chainId as CHAINS_SDK, hash);
};
