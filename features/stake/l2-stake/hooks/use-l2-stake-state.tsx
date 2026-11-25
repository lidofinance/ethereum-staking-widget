import { useConfig } from 'config';
import type { CHAIN_ID } from 'config/chains';
import {
  getPrettyChainName,
  useDappStatus,
  useIsLedgerLive,
} from 'modules/web3';
import { useMemo } from 'react';
import { parseEther } from 'viem';

export const useL2StakeState = () => {
  const { chainId } = useDappStatus();
  const isLedgerLive = useIsLedgerLive();
  const { l2Stake, featureFlags } = useConfig().externalConfig;
  const chainState = l2Stake.perChain[chainId as CHAIN_ID];

  let isEnabled = true;
  let reason: string | null = null;

  if (chainState.enabled === false) {
    isEnabled = false;
    reason =
      chainState.disableReason ??
      `Staking is currently not available for ${getPrettyChainName(chainId)}`;
  }

  if (isLedgerLive && !featureFlags?.ledgerLiveL2) {
    isEnabled = false;
    reason = `Staking is currently not available for Ledger Live on ${getPrettyChainName(chainId)}`;
  }

  const liquidityTargetEth = useMemo(() => {
    try {
      return parseEther(chainState.liquidityTarget.toFixed(18));
    } catch {
      return undefined;
    }
  }, [chainState.liquidityTarget]);

  return { isEnabled, reason, state: chainState, liquidityTargetEth };
};
