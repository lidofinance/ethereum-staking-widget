import { useConnect } from 'wagmi';
import { useConnectorInfo } from 'reef-knot/core-react';
// TODO: to remove the 'reef-knot/web3-react' after it will be deprecated
import { helpers } from 'reef-knot/web3-react';

import { useDappStatus } from 'modules/web3';
import { wagmiChainMap } from 'modules/web3/web3-provider/web3-provider';
import { joinWithOr } from 'utils/join-with-or';

export const useErrorMessage = (): string | undefined => {
  const { isLedger } = useConnectorInfo();
  const {
    isSupportedChain,
    isAccountActive,
    chainId,
    isChainIdMatched,
    isSwitchChainWait,
    supportedChainLabels,
  } = useDappStatus();
  const { error } = useConnect();

  // Errors from chain state

  if (isAccountActive && !isChainIdMatched && !isSwitchChainWait) {
    return `Wrong network. Please switch to ${wagmiChainMap[chainId].name} in your wallet to wrap/unwrap.`;
  }

  if (!isSupportedChain) {
    const switchTo = joinWithOr(supportedChainLabels);

    return `Unsupported chain. Please switch to ${switchTo} in your wallet.`;
  }

  // errors from connection state

  if (!error) {
    return;
  }

  if (isLedger) {
    return helpers.interceptLedgerError(error).message;
  }

  return error?.message;
};
