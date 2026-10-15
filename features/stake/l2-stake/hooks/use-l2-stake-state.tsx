import { CHAINS, useConfig } from 'config';
import { ManifestConfigL2StakeModes } from 'config/external-config';
import {
  getPrettyChainName,
  useDappStatus,
  useIsLedgerLive,
} from 'modules/web3';
import { useMemo } from 'react';
import { parseEther } from 'viem';

import { useL2StakeOnChainState } from './use-l2-stake-on-chain-state';

export type L2StakeLaneState = {
  isAvailable: boolean;
  reason: string | null;
};

type LaneGate = {
  // the remote config mode allows the lane
  isAllowedByMode: boolean;
  modeReason: string;
  // the lane is open on chain; undefined while unknown
  isOpenOnChain: boolean | undefined;
  pausedReason: string;
};

// The state of the two staking lanes on the current L2, from the remote
// config (kill switch, mode) and the chain (pauses). `isEnabled` and
// `reason` are the fast lane's: the one the stake form offers today
export const useL2StakeState = () => {
  const { chainId } = useDappStatus();
  const isLedgerLive = useIsLedgerLive();
  const { l2Stake, featureFlags } = useConfig().externalConfig;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const chainState = l2Stake.perChain[chainId as CHAINS];
  const chainName = getPrettyChainName(chainId);
  const { data: onChainState, isLoading: isOnChainStateLoading } =
    useL2StakeOnChainState();

  // gates that close both lanes at once
  let isEnabled = true;
  let reason: string | null = null;

  if (chainState.enabled === false) {
    isEnabled = false;
    reason =
      chainState.disableReason ??
      `Staking is currently not available for ${chainName}`;
  }

  if (isLedgerLive && !featureFlags?.ledgerLiveL2) {
    isEnabled = false;
    reason = `Staking is currently not available for Ledger Live on ${chainName}`;
  }

  // An unknown on-chain state, still loading or unreadable, does not close a
  // lane: a send into a paused lane fails on its own, while a closed form on
  // a flaky RPC would hide a working route
  const gateLane = ({
    isAllowedByMode,
    modeReason,
    isOpenOnChain,
    pausedReason,
  }: LaneGate): L2StakeLaneState => {
    if (!isEnabled) return { isAvailable: false, reason };
    if (!isAllowedByMode) return { isAvailable: false, reason: modeReason };
    if (isOpenOnChain === false)
      return { isAvailable: false, reason: pausedReason };
    return { isAvailable: true, reason: null };
  };

  const fastLane = gateLane({
    isAllowedByMode:
      chainState.mode !== ManifestConfigL2StakeModes.slowLaneOnly,
    modeReason: `Staking is currently not available for ${chainName}`,
    isOpenOnChain: onChainState?.isFastLaneAvailable,
    pausedReason: `Staking on ${chainName} is temporarily paused`,
  });

  const slowLane = gateLane({
    isAllowedByMode:
      chainState.mode !== ManifestConfigL2StakeModes.fastLaneOnly,
    modeReason: `Staking via Shuttle is currently not available for ${chainName}`,
    isOpenOnChain: onChainState?.isSlowLaneAvailable,
    pausedReason: `Staking via Shuttle on ${chainName} is temporarily paused`,
  });

  const liquidityTargetEth = useMemo(() => {
    try {
      return parseEther(chainState.liquidityTarget.toFixed(18));
    } catch {
      return undefined;
    }
  }, [chainState.liquidityTarget]);

  return {
    isEnabled: fastLane.isAvailable,
    reason: fastLane.reason,
    fastLane,
    slowLane,
    isOnChainStateLoading,
    state: chainState,
    liquidityTargetEth,
  };
};
