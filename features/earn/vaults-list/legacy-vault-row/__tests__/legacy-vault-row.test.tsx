import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { LegacyVaultRow } from '../legacy-vault-row';

vi.mock('shared/components/local-link', () => ({
  LocalLink: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

type Props = Partial<Parameters<typeof LegacyVaultRow>[0]>;

const render = (props: Props = {}) =>
  renderToStaticMarkup(
    <LegacyVaultRow
      title="Lido stRATEGY"
      description="Exposure to leading DeFi protocols"
      urlSlug="strategy"
      tvl={161_000_000}
      {...props}
    />,
  );

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('LegacyVaultRow', () => {
  it('links the row and the arrow button to the vault page', () => {
    const html = render();
    expect(html).toContain('data-testid="strategy-vault-card"');
    expect(html.match(/href="\/earn\/strategy\/deposit"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Open Lido stRATEGY"');
  });

  it('shows the title, description and TVL', () => {
    const result = text(render());
    expect(result).toContain('Lido stRATEGY');
    expect(result).toContain('Exposure to leading DeFi protocols');
    expect(result).toContain('TVL $161');
  });

  it('shows the "Upgrading" tag only for upgradable vaults', () => {
    expect(render()).toContain('data-testid="upgrading-badge"');
    expect(render({ isUpgradable: false })).not.toContain(
      'data-testid="upgrading-badge"',
    );
  });

  it('shows a skeleton instead of TVL while loading', () => {
    expect(text(render({ isLoading: true }))).not.toContain('$161');
  });
});
