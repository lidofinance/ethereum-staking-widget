import { CHAINS } from '@lido-sdk/constants';
import { getWithdrawalRequestNFTAddress } from 'customSdk/contracts';

export const NFT_URL_PREFIX_BY_NETWORK: {
  [key in CHAINS]?: (nftId: string, contract: string) => string;
} = {
  [CHAINS.Mainnet]: (nftId, contract) =>
    `https://etherscan.io/nft/${contract}/${nftId}`,
  [CHAINS.Goerli]: (nftId, contract) =>
    `https://goerli.etherscan.io/nft/${contract}/${nftId}`,
  [CHAINS.Zhejiang]: (nftId, contract) =>
    `https://blockscout.com/eth/zhejiang-testnet/token/${contract}/instance/${nftId}/token-transfers`,
};

export const getNFTUrl = (chainId: CHAINS, tokenId: string) => {
  const contractAddress = getWithdrawalRequestNFTAddress(chainId);

  return NFT_URL_PREFIX_BY_NETWORK[chainId]?.(tokenId, contractAddress) || '';
};
