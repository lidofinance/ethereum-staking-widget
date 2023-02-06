import { FC } from 'react';
import { ProviderWeb3 } from '@reef-knot/web3-react';
import { backendRPC, dynamics } from 'config';

const Web3Provider: FC = ({ children }) => (
  <ProviderWeb3
    defaultChainId={dynamics.defaultChain}
    supportedChainIds={dynamics.supportedChains}
    rpc={backendRPC}
  >
    {children}
  </ProviderWeb3>
);

export default Web3Provider;
