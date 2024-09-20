import { CHAINS } from '@lido-sdk/constants';
import { contractHooksFactory } from '@lido-sdk/react';
import invariant from 'tiny-invariant';

import { PartialStakingRouterAbi__factory } from 'generated/factories/PartialStakingRouterAbi__factory';

export const STAKING_ROUTER_BY_NETWORK: {
  [key in CHAINS]?: string;
} = {
  [CHAINS.Mainnet]: '0xFdDf38947aFB03C621C71b06C9C70bce73f12999',
  [CHAINS.Holesky]: '0xd6EbF043D30A7fe46D1Db32BA90a0A51207FE229',
  [CHAINS.Sepolia]: '0x4F36aAEb18Ab56A4e380241bea6ebF215b9cb12c',
};

export const getStakingRouterAddress = (chainId: CHAINS): string => {
  const _chainId =
    chainId === CHAINS.OptimismSepolia ? CHAINS.Sepolia : chainId;
  const address = STAKING_ROUTER_BY_NETWORK[_chainId];
  invariant(address, 'chain is not supported');
  return address;
};

export const stakingRouter = contractHooksFactory(
  PartialStakingRouterAbi__factory,
  (chainId) => getStakingRouterAddress(chainId),
);
