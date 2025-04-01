import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import type { Address } from 'viem';

import { CONTRACTS_MAP } from 'config/contracts-map';

export const getStakingRouterAddress = (
  chainId: CHAINS,
): Address | undefined => {
  return CONTRACTS_MAP?.[chainId]?.STAKING_ROUTER || undefined;
};

export const getWithdrawalQueueAddress = (
  chainId: CHAINS,
): Address | undefined => {
  return CONTRACTS_MAP?.[chainId]?.WITHDRAWAL_QUEUE || undefined;
};
