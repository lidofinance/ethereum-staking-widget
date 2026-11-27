import { useCallback } from 'react';
import { parseEther } from 'viem';

import { useConfig, type CHAINS } from 'config';
import { getPrettyChainName, useIsLedgerLive } from 'modules/web3';

import { errorTexts } from '../../../utils';

import type { L2StakeState } from './types';

/**
 * Fast stake state of a chain, from the remote config and the wallet: off
 * with a reason (config, or Ledger Live without the L2 flag), and the pool
 * liquidity target.
 */
export const useGetL2StakeState = () => {
  const { l2Stake, featureFlags } = useConfig().externalConfig;
  const isLedgerLive = useIsLedgerLive();

  return useCallback(
    (chainId: number): L2StakeState => {
      const chainState = l2Stake.perChain[chainId as CHAINS] ?? l2Stake.common;
      const chain = getPrettyChainName(chainId);

      let unavailableReason: string | null = null;
      if (chainState.enabled === false) {
        unavailableReason =
          chainState.disableReason ??
          errorTexts.forms.stake.chainUnavailable(chain);
      }
      if (isLedgerLive && !featureFlags?.ledgerLiveL2) {
        unavailableReason = errorTexts.forms.stake.ledgerLiveUnavailable(chain);
      }

      let liquidityTargetEth: bigint | undefined;
      try {
        liquidityTargetEth = parseEther(chainState.liquidityTarget.toFixed(18));
      } catch {
        liquidityTargetEth = undefined;
      }

      return { unavailableReason, liquidityTargetEth };
    },
    [l2Stake, featureFlags?.ledgerLiveL2, isLedgerLive],
  );
};
