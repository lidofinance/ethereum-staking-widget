import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';

import { Link, isOuterLink } from './index';

const render = (ui: React.ReactElement, initialEntry = '/') =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>,
  );

describe('isOuterLink', () => {
  it('detects outer hrefs', () => {
    expect(isOuterLink('https://lido.fi')).toBe(true);
    expect(isOuterLink('http://lido.fi')).toBe(true);
    expect(isOuterLink('HTTPS://LIDO.FI')).toBe(true);
    expect(isOuterLink('mailto:info@lido.fi')).toBe(true);
    expect(isOuterLink('tel:+123456')).toBe(true);
    expect(isOuterLink('//lido.fi')).toBe(true);
  });

  it('does not flag internal hrefs', () => {
    expect(isOuterLink('/stake')).toBe(false);
    expect(isOuterLink('stake')).toBe(false);
    expect(isOuterLink('#faq')).toBe(false);
    expect(isOuterLink('?ref=0x123')).toBe(false);
    expect(isOuterLink('/withdrawals/request?tab=claim#top')).toBe(false);
  });
});

describe('Link (outer)', () => {
  it('renders a plain anchor with security attributes by default', () => {
    const html = render(<Link href="https://lido.fi">out</Link>);
    expect(html).toContain('href="https://lido.fi"');
    expect(html).toContain('target="_blank"');
    expect(html).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(html).toMatch(/rel="[^"]*noreferrer[^"]*"/);
  });

  it('lets props override rel and target', () => {
    const html = render(
      <Link href="https://lido.fi" rel="nofollow" target="_self">
        out
      </Link>,
    );
    expect(html).toContain('rel="nofollow"');
    expect(html).toContain('target="_self"');
    expect(html).not.toContain('noopener');
  });

  it('does not forward passthrough search params to external origins', () => {
    const html = render(
      <Link href="https://lido.fi/page">out</Link>,
      '/?ref=0x1234',
    );
    expect(html).toContain('href="https://lido.fi/page"');
    expect(html).not.toContain('ref=0x1234');
  });

  it('does not leak router-only props into the DOM', () => {
    const html = render(
      <Link href="https://lido.fi" replace preventScrollReset>
        out
      </Link>,
    );
    expect(html).not.toContain('replace');
    expect(html).not.toContain('preventScrollReset');
  });
});

describe('Link (internal)', () => {
  it('still renders router links with passthrough params', () => {
    const html = render(<Link href="/stake">in</Link>, '/?ref=0x1234');
    expect(html).toContain('href="/stake?ref=0x1234"');
    expect(html).not.toContain('target="_blank"');
  });
});
