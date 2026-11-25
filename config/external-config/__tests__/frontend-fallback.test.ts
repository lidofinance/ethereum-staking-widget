import localManifest from 'REMOTE_CONFIG_MANIFEST.json';

import {
  getFallbackedManifestEntry,
  overrideManifestConfig,
} from '../frontend-fallback';
import { ManifestSchema } from '../validate';

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
      '1',
    );

    expect(entry.config.earnAllocation.labelAllowList).toEqual([
      'aave',
      'wsteth',
    ]);
  });

  it('uses an empty config extension when baseConfig has none', () => {
    const entry = getFallbackedManifestEntry(
      { baseConfig: {}, '1': validEntry },
      '1',
    );

    expect(entry.config.earnAllocation.labelAllowList).toEqual([]);
  });

  it.each([
    { reason: 'the remote manifest is invalid', manifest: {} },
    {
      reason: 'the remote manifest has no entry for the requested network',
      manifest: { baseConfig: {}, '560048': validEntry },
    },
  ])('uses the local entry when $reason', ({ manifest }) => {
    const entry = getFallbackedManifestEntry(manifest, '1');

    expect(entry).toEqual(ManifestSchema.parse(localManifest)['1']);
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
      '1',
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
      '1',
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
      '1',
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
