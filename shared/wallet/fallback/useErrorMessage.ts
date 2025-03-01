import { useDappStatus } from 'modules/web3';
import { useConnectorInfo } from 'reef-knot/core-react';
// TODO: to remove the 'reef-knot/web3-react' after it will be deprecated
import { helpers } from 'reef-knot/web3-react';
import { joinWithOr } from 'utils/join-with-or';
import { useConnect } from 'wagmi';

export const useErrorMessage = (): string | undefined => {
  const { isLedger } = useConnectorInfo();
  const {
    isSupportedChain,
    isChainMatched,
    isAccountActive,
    chainType,
    supportedChainLabels,
  } = useDappStatus();
  const { error } = useConnect();

  // Errors from chain state

  if (isAccountActive && !isChainMatched) {
    return `Wrong network. Please switch to ${supportedChainLabels[chainType]} in your wallet to wrap/unwrap.`;
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
