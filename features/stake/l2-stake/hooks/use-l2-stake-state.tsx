import { CHAINS, useConfig } from 'config';
import {
  getPrettyChainName,
  useDappStatus,
  useIsLedgerLive,
} from 'modules/web3';

export const useL2StakeState = () => {
  const { chainId } = useDappStatus();
  const isLedgerLive = useIsLedgerLive();
  const { l2Stake, featureFlags } = useConfig().externalConfig;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const chainState = l2Stake.perChain[chainId as CHAINS];

  let isEnabled = true;
  let reason: string | null = null;

  if (chainState.enabled === false) {
    isEnabled = false;
    reason = `Staking is currently not available for ${getPrettyChainName(chainId)}`;
  }

  if (isLedgerLive && !featureFlags?.ledgerLiveL2) {
    isEnabled = false;
    reason = `Staking is currently not available for Ledger Live on ${getPrettyChainName(chainId)}`;
  }

  return { isEnabled, reason, state: chainState };
};
