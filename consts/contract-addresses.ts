import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import type { Address } from 'viem';

import { CONTRACTS_MAP } from 'config';

export const STAKING_ROUTER_BY_NETWORK: {
  [key in CHAINS]?: Address;
} = {
  [CHAINS.Mainnet]: CONTRACTS_MAP.mainnet.STAKING_ROUTER,
  [CHAINS.Holesky]: CONTRACTS_MAP.holesky.STAKING_ROUTER,
  [CHAINS.Hoodi]: CONTRACTS_MAP.hoodi.STAKING_ROUTER,
  [CHAINS.Sepolia]: CONTRACTS_MAP.sepolia.STAKING_ROUTER,
};

export const getStakingRouterAddress = (
  chainId: CHAINS,
): Address | undefined => {
  return STAKING_ROUTER_BY_NETWORK[chainId] || undefined;
};

export const WITHDRAWAL_QUEUE_BY_NETWORK: {
  [key in CHAINS]?: Address;
} = {
  [CHAINS.Mainnet]: CONTRACTS_MAP.mainnet.WITHDRAWAL_QUEUE,
  [CHAINS.Holesky]: CONTRACTS_MAP.holesky.WITHDRAWAL_QUEUE,
  [CHAINS.Hoodi]: CONTRACTS_MAP.hoodi.WITHDRAWAL_QUEUE,
  [CHAINS.Sepolia]: CONTRACTS_MAP.sepolia.WITHDRAWAL_QUEUE,
};

export const getWithdrawalQueueAddress = (
  chainId: CHAINS,
): Address | undefined => {
  return WITHDRAWAL_QUEUE_BY_NETWORK[chainId] || undefined;
};
