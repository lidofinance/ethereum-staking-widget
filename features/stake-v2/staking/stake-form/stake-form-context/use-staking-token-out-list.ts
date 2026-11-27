import { useMemo } from 'react';

import { getTokenAddress } from 'config/networks/token-address';
import { isSupportedL2Chain, isSupportedL2StakingChain } from 'consts/chains';
import { TOKENS } from 'consts/tokens';
import { useDappStatus } from 'modules/web3';

import { STAKE_TOKENS_OUT } from './consts';
import type { StakeTokenOut, StakeTokenOutValue } from './types';

// what staking gives on a chain: stETH or wstETH on L1, wstETH on an L2
// with fast staking, nothing on the others
const getStakingTokensOut = (chainId: number): readonly StakeTokenOut[] => {
  if (!isSupportedL2Chain(chainId)) return STAKE_TOKENS_OUT;
  if (isSupportedL2StakingChain(chainId)) return [TOKENS.wsteth];
  return [];
};

/**
 * Every token staking can give, on the chains of the nearest Support*Chains
 * provider, in chain order, stETH first. Needs no reads.
 */
export const useStakingTokenOutList = (): StakeTokenOutValue[] => {
  const { supportedChainIds } = useDappStatus();
  // a stable key: the provider rebuilds the id array on every chain switch
  const chainKey = supportedChainIds.join(',');

  return useMemo(
    () =>
      (chainKey ? chainKey.split(',').map(Number) : []).flatMap((chainId) =>
        getStakingTokensOut(chainId)
          .filter((token) => !!getTokenAddress(chainId, token))
          .map((token) => ({ token, chainId })),
      ),
    [chainKey],
  );
};
