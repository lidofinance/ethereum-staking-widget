import { useDappStatus } from 'modules/web3';
import { useConnectorInfo } from 'reef-knot/core-react';
// TODO: to remove the 'reef-knot/web3-react' after it will be deprecated
import { helpers } from 'reef-knot/web3-react';
import { joinWithOr } from 'utils/join-with-or';
import { useConnect } from 'wagmi';

import { getPrettyChainName } from 'modules/web3/consts/chains';

export const useErrorMessage = (toActionText?: string): string | undefined => {
  const { isLedger } = useConnectorInfo();
  const {
    chainId,
    isSupportedChain,
    isChainMatched,
    isAccountActive,
    supportedChainLabels,
  } = useDappStatus();
  const { error } = useConnect();

  // Errors from chain state

  if (isAccountActive && !isChainMatched) {
    return `Wrong network. Please switch to ${getPrettyChainName(chainId)} in your wallet to ${toActionText}.`;
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
