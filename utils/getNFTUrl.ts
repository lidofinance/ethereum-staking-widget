import type { Address } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

export const NFT_URL_PREFIX_BY_NETWORK: {
  [key in CHAINS]?: (nftId: string, contract: string) => string;
} = {
  [CHAINS.Mainnet]: (nftId, contract) =>
    `https://etherscan.io/nft/${contract}/${nftId}`,
  [CHAINS.Holesky]: (nftId, contract) =>
    `https://holesky.etherscan.io/nft/${contract}/${nftId}`,
  [CHAINS.Hoodi]: (nftId, contract) =>
    `https://hoodi.etherscan.io/nft/${contract}/${nftId}`,
  [CHAINS.Sepolia]: (nftId, contract) =>
    `https://sepolia.etherscan.io/nft/${contract}/${nftId}`,
};

export const getNFTUrl = (
  tokenId: string,
  contractAddress?: Address | null,
  chainId?: CHAINS,
) => {
  if (!chainId || !contractAddress) return '';

  try {
    return NFT_URL_PREFIX_BY_NETWORK[chainId]?.(tokenId, contractAddress) || '';
  } catch {
    return '';
  }
};
