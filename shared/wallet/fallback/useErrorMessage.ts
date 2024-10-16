import { useDappStatus } from 'modules/web3';
import {
  useConnectorInfo,
  getUnsupportedChainError,
} from 'reef-knot/core-react';
// TODO: to remove the 'reef-knot/web3-react' after it will be deprecated
import { helpers } from 'reef-knot/web3-react';
import { useConnect, useConfig } from 'wagmi';

export const useErrorMessage = (): string | undefined => {
  const { chains } = useConfig();
  const { isSupportedChain, isWalletConnected } = useDappStatus();
  const { error } = useConnect();

  const { isLedger } = useConnectorInfo();

  if (isWalletConnected && !isSupportedChain) {
    return getUnsupportedChainError(chains).message;
  }

  if (!error) {
    return;
  }

  if (isLedger) {
    return helpers.interceptLedgerError(error).message;
  }

  return error?.message;
};
