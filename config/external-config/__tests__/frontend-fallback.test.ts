import { getFallbackedManifestEntry } from '../frontend-fallback';

const validEntry = {
  leastSafeVersion: '1.0.0',
};

describe('getFallbackedManifestEntry', () => {
  it('uses baseConfig values from the remote manifest', () => {
    const entry = getFallbackedManifestEntry(
      {
        baseConfig: {
          earnVaultAllocationLabelAllowlist: ['Aave', 'wstETH'],
        },
        '1': validEntry,
      },
      1,
    );

    expect(entry.config.earnVaultAllocationLabelAllowlist).toEqual([
      'aave',
      'wsteth',
    ]);
  });

  it('uses an empty config extension when baseConfig has none', () => {
    const entry = getFallbackedManifestEntry(
      { baseConfig: {}, '1': validEntry },
      1,
    );

    expect(entry.config.earnVaultAllocationLabelAllowlist).toEqual([]);
  });

  it('uses the whole local manifest when the remote manifest is invalid', () => {
    const entry = getFallbackedManifestEntry({}, 1);

    expect(entry.config.featureFlags.dgBannerEnabled).toBe(true);
  });

  it('materializes local network overrides on top of baseConfig', () => {
    const mainnet = getFallbackedManifestEntry({}, 1);
    const staging = getFallbackedManifestEntry({}, 1, 'staging');
    const holesky = getFallbackedManifestEntry({}, 17000);
    const hoodi = getFallbackedManifestEntry({}, 560048);

    expect(mainnet.config.api.validation?.version).toBe('2');
    expect(staging.config.api.validation?.version).toBe('1');
    expect(holesky.config.earnVaults).toEqual([]);
    expect(holesky.config.withdrawalDex.enabled).toBe(false);
    expect(hoodi.config.earnVaults.map(({ name }) => name)).toEqual([
      'eth',
      'usd',
      'strategy',
      'ggv',
      'dvv',
    ]);
    expect(hoodi.config.featureFlags.dgBannerEnabled).toBe(false);
  });

  it('allows a network config to replace a baseConfig array', () => {
    const entry = getFallbackedManifestEntry(
      {
        baseConfig: {
          earnVaultAllocationLabelAllowlist: ['base-value'],
        },
        '1': {
          ...validEntry,
          config: {
            earnVaultAllocationLabelAllowlist: ['network-value'],
          },
        },
      },
      1,
    );

    expect(entry.config.earnVaultAllocationLabelAllowlist).toEqual([
      'network-value',
    ]);
  });

  it('treats an explicitly empty network array as authoritative', () => {
    const entry = getFallbackedManifestEntry(
      {
        baseConfig: {
          earnVaultAllocationLabelAllowlist: ['base-value'],
        },
        '1': {
          ...validEntry,
          config: { earnVaultAllocationLabelAllowlist: [] },
        },
      },
      1,
    );

    expect(entry.config.earnVaultAllocationLabelAllowlist).toEqual([]);
  });
});
