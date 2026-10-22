// SW-ROUTE-ADMIT-08: server admission read the base entry while page props and
// the browser read the override entry, so an override deployment redirected
// routes that its own policy enabled
vi.mock('config', () => ({
  config: { defaultChain: 1, manifestOverride: 'staging' },
}));

import { getConfiguredManifestKey, shouldRedirectToRoot } from '../utils';

const page = (shouldDisable: boolean) => ({
  shouldDisable,
  showNew: false,
  sections: [],
});

const manifest = (base: boolean, override: boolean) =>
  ({
    baseConfig: {},
    '1': {
      leastSafeVersion: '1.0.0',
      config: { pages: { '/withdrawals': page(base) } },
    },
    '1-staging': {
      leastSafeVersion: '1.0.0',
      config: { pages: { '/withdrawals': page(override) } },
    },
  }) as unknown as Parameters<typeof shouldRedirectToRoot>[1];

describe('getConfiguredManifestKey', () => {
  it('derives the entry key from the configured chain and override', () => {
    expect(getConfiguredManifestKey()).toBe('1-staging');
  });
});

describe('shouldRedirectToRoot on an override deployment', () => {
  it('admits a route the override entry enables, whatever the base says', () => {
    expect(shouldRedirectToRoot('/withdrawals', manifest(true, false))).toBe(
      false,
    );
  });

  it('redirects a route the override entry disables, whatever the base says', () => {
    expect(shouldRedirectToRoot('/withdrawals', manifest(false, true))).toBe(
      true,
    );
  });

  it('does not redirect when the override entry is missing', () => {
    const baseOnly = {
      baseConfig: {},
      '1': {
        leastSafeVersion: '1.0.0',
        config: { pages: { '/withdrawals': page(true) } },
      },
    } as unknown as Parameters<typeof shouldRedirectToRoot>[1];
    expect(shouldRedirectToRoot('/withdrawals', baseOnly)).toBe(false);
  });
});
