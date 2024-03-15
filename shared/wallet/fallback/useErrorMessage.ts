import {
  useSupportedChains,
  useConnectorError,
  helpers,
} from 'reef-knot/web3-react';
import { useNetwork } from 'wagmi';

export const useErrorMessage = (): string | undefined => {
  const error = useConnectorError();
  const { isUnsupported } = useSupportedChains();
  const { chains: supportedChains } = useNetwork();

  // TODO: fix useConnectorError in reef-knot and remove this block
  if (isUnsupported) {
    return helpers.getUnsupportedChainError(supportedChains).message;
  }

  return error?.message;
};
