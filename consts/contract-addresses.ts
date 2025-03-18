import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import type { Address } from 'viem';

export const STAKING_ROUTER_BY_NETWORK: {
  [key in CHAINS]?: Address;
} = {
  [CHAINS.Mainnet]: '0xFdDf38947aFB03C621C71b06C9C70bce73f12999',
  [CHAINS.Holesky]: '0xd6EbF043D30A7fe46D1Db32BA90a0A51207FE229',
  [CHAINS.Hoodi]: '0xCc820558B39ee15C7C45B59390B503b83fb499A8',
  [CHAINS.Sepolia]: '0x4F36aAEb18Ab56A4e380241bea6ebF215b9cb12c',
};

export const getStakingRouterAddress = (
  chainId: CHAINS,
): Address | undefined => {
  return STAKING_ROUTER_BY_NETWORK[chainId] || undefined;
};

export const WITHDRAWAL_QUEUE_BY_NETWORK: {
  [key in CHAINS]?: Address;
} = {
  [CHAINS.Mainnet]: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',
  [CHAINS.Holesky]: '0xc7cc160b58F8Bb0baC94b80847E2CF2800565C50',
  [CHAINS.Hoodi]: '0xfe56573178f1bcdf53F01A6E9977670dcBBD9186',
  [CHAINS.Sepolia]: '0x1583C7b3f4C3B008720E6BcE5726336b0aB25fdd',
};

export const getWithdrawalQueueAddress = (
  chainId: CHAINS,
): Address | undefined => {
  return WITHDRAWAL_QUEUE_BY_NETWORK[chainId] || undefined;
};
