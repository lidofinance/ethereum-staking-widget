import { renderToStaticMarkup } from 'react-dom/server';

import { UpgradeAssetsBlock } from '../upgrade-assets';

type State = {
  isWalletConnected: boolean;
  isDepositGeoAvailable: boolean;
  isDepositEnabled: boolean;
  balances: { streth?: bigint; dvsteth?: bigint };
};

const state = vi.hoisted<State>(() => ({
  isWalletConnected: true,
  isDepositGeoAvailable: true,
  isDepositEnabled: true,
  balances: {},
}));

vi.mock('modules/web3', () => ({
  useDappStatus: () => ({
    isWalletConnected: state.isWalletConnected,
    address: '0x1',
    chainId: 1,
  }),
}));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
vi.mock('../use-upgradable-token-balances', () => ({
  useUpgradableTokenBalances: () => ({
    balances: state.balances,
    fetchBalances: vi.fn(),
  }),
}));
vi.mock('shared/hooks/use-query-values-form', () => ({
  useReferralQueryValue: () => undefined,
}));
vi.mock('features/earn/shared/hooks/use-earn-geo-gate', () => ({
  useEarnGeoGate: () => ({
    isDepositGeoAvailable: state.isDepositGeoAvailable,
  }),
}));
vi.mock('../../hooks/use-vault-available', () => ({
  useEthVaultAvailable: () => ({ isDepositEnabled: state.isDepositEnabled }),
}));
vi.mock('../../drawer-context', () => ({
  useEthVaultDrawer: () => ({ openDrawer: vi.fn() }),
}));
vi.mock('../../deposit/hooks', () => ({
  useEthVaultDeposit: () => ({ deposit: vi.fn() }),
}));
vi.mock('shared/formatters/format-token', () => ({
  FormatToken: ({ symbol }: { symbol: string }) => <span>{symbol}</span>,
}));
// SVG imports are not transformed in unit tests
vi.mock('assets/earn', () => ({
  TokenStrethIcon: () => <svg data-testid="icon-streth" />,
  TokenDvstethIcon: () => <svg data-testid="icon-dvsteth" />,
}));

const render = () => renderToStaticMarkup(<UpgradeAssetsBlock />);

describe('UpgradeAssetsBlock', () => {
  beforeEach(() => {
    state.isWalletConnected = true;
    state.isDepositGeoAvailable = true;
    state.isDepositEnabled = true;
    state.balances = { streth: 1n, dvsteth: 2n };
  });

  it('renders a row with an upgrade button for each token with a balance', () => {
    const html = render();
    expect(html).toContain('data-testid="upgradable-tokens-banner"');
    expect(html).toContain('Available to upgrade');
    expect(html).toContain('data-testid="howItWorksButton"');
    expect(html).toContain('data-testid="icon-streth"');
    expect(html).toContain('data-testid="icon-dvsteth"');
    expect(html.match(/data-testid="upgrade-button"/g)).toHaveLength(2);
  });

  it('skips the tokens with a zero balance', () => {
    state.balances = { streth: 0n, dvsteth: 2n };
    const html = render();
    expect(html).not.toContain('data-testid="streth"');
    expect(html).toContain('data-testid="dvsteth"');
  });

  it.each([
    ['the wallet is not connected', () => (state.isWalletConnected = false)],
    ['the region is blocked', () => (state.isDepositGeoAvailable = false)],
    ['deposits are paused', () => (state.isDepositEnabled = false)],
    ['no token has a balance', () => (state.balances = {})],
  ])('renders nothing when %s', (_, arrange) => {
    arrange();
    expect(render()).toBe('');
  });
});
