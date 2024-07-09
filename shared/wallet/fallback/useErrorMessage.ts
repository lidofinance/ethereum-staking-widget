import {
  useConnectorInfo,
  getUnsupportedChainError,
} from 'reef-knot/core-react';
import { helpers, useSupportedChains } from 'reef-knot/web3-react';
import { useAccount, useConfig, useConnect } from 'wagmi';

export const useErrorMessage = (): string | undefined => {
  const { error } = useConnect();
  const { chains } = useConfig();
  const { isConnected } = useAccount();
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
