import {
  useConnectorInfo,
  getUnsupportedChainError,
} from 'reef-knot/core-react';
// TODO: to remove the 'reef-knot/web3-react' after it will be deprecated
import { helpers, useSupportedChains } from 'reef-knot/web3-react';
import { useAccount, useConnect, useConfig } from 'wagmi';

export const useErrorMessage = (): string | undefined => {
  const { chains } = useConfig();
  const { isConnected } = useAccount();
  const { error } = useConnect();

  const { isUnsupported } = useSupportedChains();
  const { isLedger } = useConnectorInfo();

  if (isConnected && isUnsupported) {
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
