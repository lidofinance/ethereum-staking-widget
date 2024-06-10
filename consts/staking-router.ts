import { CHAINS } from '@lido-sdk/constants';
import { contractHooksFactory } from '@lido-sdk/react';
import invariant from 'tiny-invariant';

import { StakingRouterAbi__factory } from 'generated/factories/StakingRouterAbi__factory';

export const STAKING_ROUTER_BY_NETWORK: {
  [key in CHAINS]?: string;
} = {
  [CHAINS.Mainnet]: '0xFdDf38947aFB03C621C71b06C9C70bce73f12999',
  [CHAINS.Holesky]: '0xd6EbF043D30A7fe46D1Db32BA90a0A51207FE229',
};

export const getStakingRouterAddress = (chainId: CHAINS): string => {
  const address = STAKING_ROUTER_BY_NETWORK[chainId];
  invariant(address, 'chain is not supported');
  return address;
};

export const stakingRouter = contractHooksFactory(
  StakingRouterAbi__factory,
  (chainId) => getStakingRouterAddress(chainId),
);
