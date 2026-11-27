import { renderToStaticMarkup } from 'react-dom/server';

import { VaultSidePanel } from '../vault-side-panel';

const state = vi.hoisted(() => ({ isWalletConnected: false }));

vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ isWalletConnected: state.isWalletConnected }),
}));
vi.mock('shared/components/local-link', () => ({
  useLocalNavigate: () => vi.fn(),
}));
vi.mock('shared/formatters/format-token', () => ({
  FormatToken: ({ amount, symbol }: { amount?: bigint; symbol: string }) =>
    `${String(amount)} ${symbol}`,
}));
// SVG imports are not transformed in unit tests
vi.mock('assets/earn', () => ({
  SidePanelGlowEth: () => null,
  SidePanelGlowUsd: () => null,
}));

type Props = Partial<Parameters<typeof VaultSidePanel>[0]>;

const render = (props: Props = {}) =>
  renderToStaticMarkup(
    <VaultSidePanel
      variant="eth"
      action="deposit"
      routes={{ deposit: '/earn/eth/deposit', withdraw: '/earn/eth/withdraw' }}
      position={{ symbol: 'ETH', sharesSymbol: 'earnETH' }}
      apx={5.12}
      {...props}
    >
      <form data-testid="form" />
    </VaultSidePanel>,
  );

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('VaultSidePanel', () => {
  beforeEach(() => {
    state.isWalletConnected = false;
  });

  it('renders the action switch, the notice, the cards above and the form', () => {
    const html = render({
      notice: <p data-testid="notice" />,
      before: <div data-testid="before" />,
    });
    expect(html).toContain('data-testid="Deposit-switch"');
    expect(html).toContain('data-testid="Withdraw-switch"');
    expect(html).toContain('data-testid="notice"');
    expect(html).toContain('data-testid="form"');
    expect(html.indexOf('data-testid="before"')).toBeLessThan(
      html.indexOf('data-testid="vault-side-panel"'),
    );
  });

  it('hides the position without a wallet', () => {
    expect(render()).not.toContain('data-testid="vault-position"');
  });

  it('shows "No position" and the APY for a wallet without shares', () => {
    state.isWalletConnected = true;
    const html = render();
    expect(text(html)).toContain('My position');
    expect(text(html)).toContain('No position');
    expect(text(html)).toContain('5.1% APY');
  });

  it('shows the amount in the base token and in USD', () => {
    state.isWalletConnected = true;
    const html = render({
      position: {
        symbol: 'ETH',
        sharesSymbol: 'earnETH',
        amount: 14n,
        sharesAmount: 12n,
        usdAmount: 23_831.2,
      },
    });
    expect(html).toContain('data-testid="my-deposit-value"');
    expect(text(html)).toContain('14 ETH');
    expect(html).toContain('data-testid="my-deposit-usd-value"');
    expect(text(html)).not.toContain('No position');
  });
});
