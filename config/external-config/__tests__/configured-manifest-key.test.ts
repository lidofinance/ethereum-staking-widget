// the browser query and the fallback must read the same entry, base or override
vi.mock('config', () => ({
  config: { defaultChain: 1, manifestOverride: 'staging' },
}));

import { getConfiguredManifestKey } from '../utils';

describe('getConfiguredManifestKey', () => {
  it('derives the entry key from the configured chain and override', () => {
    expect(getConfiguredManifestKey()).toBe('1-staging');
  });
});
