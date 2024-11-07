import { useConnections } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const useIsMetamask = () => {
  const connector = useConnections()[0]?.connector;
  if (!connector) return false;
  // eip6963
  if (connector.rdns === 'io.metamask') return true;
  // legacy
  return !!(
    connector.type === injected.type && (window?.ethereum as any)?.isMetaMask
  );
};
