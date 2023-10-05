import { CHAINS, getWithdrawalQueueAddress } from '@lido-sdk/constants';

export const NFT_URL_PREFIX_BY_NETWORK: {
  [key in CHAINS]?: (nftId: string, contract: string) => string;
} = {
  [CHAINS.Mainnet]: (nftId, contract) =>
    `https://etherscan.io/nft/${contract}/${nftId}`,
  [CHAINS.Goerli]: (nftId, contract) =>
    `https://goerli.etherscan.io/nft/${contract}/${nftId}`,
  [CHAINS.Holesky]: (nftId, contract) =>
    `https://holesky.etherscan.io/nft/${contract}/${nftId}`,
};

export const getNFTUrl = (tokenId: string, chainId?: CHAINS) => {
  if (!chainId) return '';
  const contractAddress = getWithdrawalQueueAddress(chainId);

  return NFT_URL_PREFIX_BY_NETWORK[chainId]?.(tokenId, contractAddress) || '';
};
