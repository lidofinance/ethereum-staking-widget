import {
  type EIP1193Provider,
  hexToNumber,
  isAddressEqual,
  getAddress,
} from 'viem';

import type { Connection } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { providersStore } from 'reef-knot/core-react';

// A provider is only suitable for routing reads through while it demonstrably
// serves the same account and chain as the active connection — a provider that
// drifted (locked wallet, silent chain/account switch, shared window.ethereum
// serving another session) must not supply transaction-driving reads.
// Returns null on any mismatch or verification failure, falling the caller
// back to default transports.
const verifyProviderMatchesConnection = async (
  provider: EIP1193Provider,
  connection: Connection,
): Promise<EIP1193Provider | null> => {
  try {
    const [accounts, chainId] = await Promise.all([
      provider.request({ method: 'eth_accounts' }),
      provider.request({ method: 'eth_chainId' }),
    ]);
    const activeAccount =
      connection.accounts[0] && getAddress(connection.accounts[0]);
    return activeAccount &&
      hexToNumber(chainId) === connection.chainId &&
      accounts.some((account) =>
        isAddressEqual(getAddress(account), activeAccount),
      )
      ? provider
      : null;
  } catch {
    return null;
  }
};

// The metaMask connector provider (@metamask/connect-evm) does not forward read
// requests to the wallet — it routes them over HTTP to public RPCs taken from
// chain.rpcUrls.default. Use the raw EIP-6963 extension provider instead,
// looked up by the rdns the connector itself declares.
// The extension is a session separate from the SDK connection (which may even be
// a mobile wallet over MWP).
const getMetaMaskInjectedProvider = async (
  connection: Connection,
): Promise<EIP1193Provider | null> => {
  const { rdns } = connection.connector;
  if (!rdns) return null;

  const provider = (typeof rdns === 'string' ? [rdns] : rdns)
    .map((rdns) => providersStore.findProvider({ rdns })?.provider)
    .find(Boolean);
  if (!provider) return null;
  return verifyProviderMatchesConnection(provider, connection);
};

// resolves the wallet provider suitable for routing read requests through,
// or null when the connection has none (then default transports are used)
export const getConnectionProvider = async (
  connection: Connection,
): Promise<EIP1193Provider | null> => {
  if (connection.connector.type === injected.type) {
    const provider = (await connection.connector.getProvider?.({
      chainId: connection.chainId,
    })) as EIP1193Provider | undefined;
    if (!provider) return null;
    return verifyProviderMatchesConnection(provider, connection);
  }
  if (connection.connector.type === metaMask.type) {
    return getMetaMaskInjectedProvider(connection);
  }
  return null;
};
