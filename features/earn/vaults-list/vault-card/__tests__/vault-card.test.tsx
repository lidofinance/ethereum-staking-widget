import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VaultCard } from '../vault-card';

const state = vi.hoisted(() => ({ isWalletConnected: false }));

vi.mock('modules/web3', () => ({
  useDappStatus: () => ({ isWalletConnected: state.isWalletConnected }),
}));
vi.mock('shared/components/local-link', () => ({
  LocalLink: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));
vi.mock('shared/formatters/format-token', () => ({
  FormatToken: ({ amount, symbol }: { amount?: bigint; symbol: string }) =>
    `${String(amount)} ${symbol}`,
}));
// the geo notice has its own hooks; here it only passes the CTA through
vi.mock('../vault-card-geo-cta', () => ({
  VaultCardGeoCta: ({ children }: { children: ReactNode }) => (
    <div data-testid="geo-cta">{children}</div>
  ),
}));

type Props = Partial<Parameters<typeof VaultCard>[0]>;

const render = (props: Props = {}) =>
  renderToStaticMarkup(
    <VaultCard
      title="EarnETH"
      description="ETH growth vault"
      urlSlug="eth"
      ctaLabel="Deposit"
      stats={{ tvl: 159_000_000, apx: 3.3, apxLabel: 'APY* (14d avg.)' }}
      position={{
        sharesSymbol: 'earnETH',
        baseSymbol: 'ETH',
      }}
      {...props}
    />,
  );

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('VaultCard', () => {
  beforeEach(() => {
    state.isWalletConnected = false;
  });

  it('links the card and the CTA to the deposit page', () => {
    const html = render();
    expect(html).toContain('data-testid="eth-vault-card"');
    expect(html).toContain('data-testid="open-vault-btn"');
    expect(html.match(/href="\/earn\/eth\/deposit"/g)).toHaveLength(2);
    expect(text(html)).toContain('Deposit');
  });

  it('shows the title, description and stats', () => {
    const html = render();
    expect(text(html)).toContain('EarnETH');
    expect(text(html)).toContain('ETH growth vault');
    expect(html).toContain('data-testid="apx-value"');
    expect(html).toContain('data-testid="tvl-amount"');
    expect(text(html)).toContain('$159');
  });

  it('hides "My position" when the wallet is not connected', () => {
    expect(text(render())).not.toContain('My position');
  });

  it('shows a dash in "My position" when the connected wallet has no shares', () => {
    state.isWalletConnected = true;
    const html = render();
    expect(text(html)).toContain('My position');
    expect(text(html)).toContain('—');
  });

  it('shows the base amount when the connected wallet has shares', () => {
    state.isWalletConnected = true;
    const html = render({
      ctaLabel: 'Manage',
      position: {
        sharesBalance: 5n,
        sharesSymbol: 'earnETH',
        baseAmount: 7n,
        baseSymbol: 'ETH',
      },
    });
    expect(text(html)).toContain('7 ETH');
    expect(text(html)).toContain('Manage');
    // desktop and mobile stats are both in the DOM; only one has the test id
    expect(html.match(/data-testid="earnETH-position-amount"/g)).toHaveLength(
      1,
    );
  });

  it('shows the protected badge only with a tooltip text', () => {
    expect(render()).not.toContain('data-testid="protected-badge"');
    const html = render({ protectedBadgeTooltipText: 'Covered' });
    expect(html).toContain('data-testid="protected-badge"');
    expect(text(html)).toContain('Protected');
  });

  it('wraps the CTA in the geo notice only when geo gated', () => {
    expect(render()).not.toContain('data-testid="geo-cta"');
    expect(render({ isGeoGated: true })).toContain('data-testid="geo-cta"');
  });
});
