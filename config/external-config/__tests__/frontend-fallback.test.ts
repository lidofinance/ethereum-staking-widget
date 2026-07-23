import {
  getFallbackedManifestEntry,
  overrideManifestConfig,
} from '../frontend-fallback';

const validEntry = {
  leastSafeVersion: '1.0.0',
};

describe('getFallbackedManifestEntry', () => {
  it('uses baseConfig values from the remote manifest', () => {
    const entry = getFallbackedManifestEntry(
      {
        baseConfig: {
          earnAllocation: {
            labelAllowList: ['Aave', 'wstETH'],
          },
        },
        '1': validEntry,
      },
      1,
    );

    expect(entry.config.earnAllocation.labelAllowList).toEqual([
      'aave',
      'wsteth',
    ]);
  });

  it('uses an empty config extension when baseConfig has none', () => {
    const entry = getFallbackedManifestEntry(
      { baseConfig: {}, '1': validEntry },
      1,
    );

    expect(entry.config.earnAllocation.labelAllowList).toEqual([]);
  });

  it('uses the whole local manifest when the remote manifest is invalid', () => {
    const entry = getFallbackedManifestEntry({}, 1);

    expect(entry.config.featureFlags.dgBannerEnabled).toBe(true);
  });

  it('materializes local network overrides on top of baseConfig', () => {
    const mainnet = getFallbackedManifestEntry({}, 1);
    const staging = getFallbackedManifestEntry({}, 1, 'staging');
    const hoodi = getFallbackedManifestEntry({}, 560048);

    expect(mainnet.config.api.validation?.version).toBe('2');
    expect(staging.config.api.validation?.version).toBe('1');
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
          earnAllocation: { labelAllowList: ['base-value'] },
        },
        '1': {
          ...validEntry,
          config: {
            earnAllocation: { labelAllowList: ['network-value'] },
          },
        },
      },
      1,
    );

    expect(entry.config.earnAllocation.labelAllowList).toEqual([
      'network-value',
    ]);
  });

  it('treats an explicitly empty network array as authoritative', () => {
    const entry = getFallbackedManifestEntry(
      {
        baseConfig: {
          earnAllocation: { labelAllowList: ['base-value'] },
        },
        '1': {
          ...validEntry,
          config: { earnAllocation: { labelAllowList: [] } },
        },
      },
      1,
    );

    expect(entry.config.earnAllocation.labelAllowList).toEqual([]);
  });
});

describe('overrideManifestConfig', () => {
  it('allows hidden allocation IDs to be overridden', () => {
    const entry = getFallbackedManifestEntry(
      {
        baseConfig: {
          earnAllocation: { hiddenIds: ['base-value'] },
        },
        '1': validEntry,
      },
      1,
    );

    const config = overrideManifestConfig(entry.config, {
      earnAllocation: {
        ...entry.config.earnAllocation,
        hiddenIds: ['override-value'],
      },
    });

    expect(config.earnAllocation.hiddenIds).toEqual(['override-value']);
  });
});
