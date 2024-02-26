import { useMemo } from 'react';
import { useSupportedChains, useConnectorError } from 'reef-knot/web3-react';
import { CHAINS } from '@lido-sdk/constants';

export const useErrorMessage = (): string | undefined => {
  const error = useConnectorError();
  const { isUnsupported, supportedChains } = useSupportedChains();

  const chains = useMemo(() => {
    const chains = supportedChains
      .map(({ chainId, name }) => CHAINS[chainId] || name)
      .filter((chain) => chain !== 'unknown');
    const lastChain = chains.pop();

    return [chains.join(', '), lastChain].filter((chain) => chain).join(' or ');
  }, [supportedChains]);

  if (isUnsupported) {
    return `Unsupported chain. Please switch to ${chains} in your wallet and restart the page.`;
  }

  return error?.message;
};
