import { describe, expect, it } from 'vitest';
import { getDefaultConfig } from 'reef-knot/core-react';
import { getDefaultWalletsModalConfig } from 'reef-knot/connect-wallet-modal';
import { WalletsListEthereum } from 'reef-knot/wallets';
import { mainnet } from 'wagmi/chains';
import { OathWallet } from '../oath-wallet';

// Exercise the installed Reef-Knot registry, rather than a mocked app list.
describe('native wallet registry integration', () => {
  it('registers independent named Oath and generic WalletConnect entries with the shared button', () => {
    const result = getDefaultConfig({
      rpc: { 1: 'https://ethereum.example' },
      defaultChain: mainnet,
      chains: [mainnet],
      autoConnect: false,
      walletconnectProjectId: 'test-project',
      walletsList: {
        oath: OathWallet,
        walletConnect: WalletsListEthereum.walletConnect,
      },
      ...getDefaultWalletsModalConfig(),
      walletsShown: ['oath', 'walletConnect'],
      walletsPinned: [],
    });
    const [oath, generic] = result.walletsDataList;
    expect(oath.walletId).toBe('oath');
    expect(generic.walletId).toBe('walletConnect');
    expect(oath.type).toBe(generic.type);
    expect(oath.createConnectorFn).not.toBe(generic.createConnectorFn);
    expect(result.walletsModalConfig.walletsShown).toEqual([
      'oath',
      'walletConnect',
    ]);
    expect(
      result.walletsModalConfig.buttonComponentsByConnectorId[oath.type],
    ).toBeDefined();
    expect(result.reefKnotConfig.walletDataList).toBe(result.walletsDataList);
  });
});
