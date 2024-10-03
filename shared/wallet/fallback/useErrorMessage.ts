import {
  useConnectorInfo,
  getUnsupportedChainError,
} from 'reef-knot/core-react';
// TODO: to remove the 'reef-knot/web3-react' after it will be deprecated
import { helpers, useSupportedChains } from 'reef-knot/web3-react';
import { useAccount, useConnect, useConfig } from 'wagmi';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { OPTIMISM, ETHEREUM, useDappChain } from 'providers/dapp-chain';
import { capitalizeFirstLetter } from 'utils/capitalize-string';

export const useErrorMessage = (): string | undefined => {
  const { chains } = useConfig();
  const { isConnected } = useAccount();
  const { error } = useConnect();

  const { isUnsupported } = useSupportedChains();
  const { isLedger } = useConnectorInfo();

  const { isDappActiveAndNetworksMatched } = useDappStatus();
  const { chainName } = useDappChain();

  if (isConnected && isUnsupported) {
    return getUnsupportedChainError(chains).message;
  }

  if (isConnected && !error && !isDappActiveAndNetworksMatched) {
    return `Wrong network. Please switch to ${chainName === OPTIMISM ? capitalizeFirstLetter(ETHEREUM) : capitalizeFirstLetter(OPTIMISM)} in your wallet to wrap/unwrap.`;
  }

  if (!error) {
    return;
  }

  if (isLedger) {
    return helpers.interceptLedgerError(error).message;
  }

  return error?.message;
};
