import type { LoaderFunctionArgs } from 'react-router';

import { hasTrailingSlash, stripTrailingSlashLoader } from '../trailing-slash';

/**
 * Trailing-slash normalization (parity with Next's `trailingSlash: false`):
 * the root loader answers a REPLACE redirect for `/wrap/`-style URLs and
 * stays silent for clean ones. See app/trailing-slash.ts.
 */

const run = (url: string): Response | null =>
  stripTrailingSlashLoader({
    request: new Request(url),
    params: {},
  } as LoaderFunctionArgs);

const expectRedirect = (res: Response | null, to: string) => {
  expect(res).toBeInstanceOf(Response);
  expect(res?.headers.get('Location')).toBe(to);
  // replace, not push — Back must not land on the slashed variant
  expect(res?.headers.get('X-Remix-Replace')).toBe('true');
};

describe('stripTrailingSlashLoader', () => {
  it('leaves clean paths alone', () => {
    expect(run('https://stake.lido.fi/')).toBeNull();
    expect(run('https://stake.lido.fi/wrap')).toBeNull();
    expect(run('https://stake.lido.fi/withdrawals/request')).toBeNull();
  });

  it('redirects a slashed path to the clean one', () => {
    expectRedirect(run('https://stake.lido.fi/wrap/'), '/wrap');
  });

  it('collapses repeated trailing slashes', () => {
    expectRedirect(run('https://stake.lido.fi/wrap///'), '/wrap');
  });

  it('normalizes a slashed root to /', () => {
    expectRedirect(run('https://stake.lido.fi//'), '/');
  });

  it('keeps query and fragment', () => {
    expectRedirect(
      run('https://stake.lido.fi/withdrawals/request/?ref=x#faq'),
      '/withdrawals/request?ref=x#faq',
    );
  });
});

describe('hasTrailingSlash', () => {
  it('spares the root path, flags everything else slashed', () => {
    expect(hasTrailingSlash('/')).toBe(false);
    expect(hasTrailingSlash('/wrap')).toBe(false);
    expect(hasTrailingSlash('/wrap/')).toBe(true);
    expect(hasTrailingSlash('//')).toBe(true);
  });
});
