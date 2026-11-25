import { useConnect } from 'wagmi';
import { useConnectorInfo, interceptLedgerError } from 'reef-knot';

import { joinWithOr } from 'utils/join-with-or';
import { useDappStatus, getPrettyChainName } from 'modules/web3';

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
    return `Wrong network. Please switch to ${getPrettyChainName(chainId)} in your wallet ${toActionText}.`;
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
    return interceptLedgerError(error).message;
  }

  return error?.message;
};
