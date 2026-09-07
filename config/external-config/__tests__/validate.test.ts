import { ManifestSchema } from '../validate';

const validEntry = {
  leastSafeVersion: '1.0.0',
};

const parseManifest = (manifest: unknown) =>
  ManifestSchema.parse(
    typeof manifest === 'object' && manifest !== null
      ? { baseConfig: {}, ...manifest }
      : manifest,
  );

describe('ManifestSchema', () => {
  describe('top-level key filtering', () => {
    it('accepts valid chain id keys', () => {
      const result = parseManifest({
        '1': validEntry,
        '137': validEntry,
      });
      expect(result).toHaveProperty('1');
      expect(result).toHaveProperty('137');
    });

    it('accepts chain id with suffix', () => {
      const result = parseManifest({ '1-staging': validEntry });
      expect(result).toHaveProperty('1-staging');
    });

    it('filters out keys starting with 0', () => {
      const result = parseManifest({
        '0': validEntry,
        '01': validEntry,
        '1': validEntry,
      });
      expect(result).not.toHaveProperty('0');
      expect(result).not.toHaveProperty('01');
      expect(result).toHaveProperty('1');
    });

    it('filters out non-numeric keys (forward compatibility)', () => {
      const result = parseManifest({ foo: validEntry, '1': validEntry });
      expect(result).not.toHaveProperty('foo');
      expect(result).toHaveProperty('1');
    });

    it('ignores unknown top-level keys instead of throwing', () => {
      expect(() =>
        parseManifest({ unknownKey: validEntry, '1': validEntry }),
      ).not.toThrow();
    });

    it('requires baseConfig', () => {
      expect(() => ManifestSchema.parse({ '1': validEntry })).toThrow();
    });

    it('throws for non-object input', () => {
      expect(() => parseManifest('not-an-object')).toThrow();
      expect(() => parseManifest(42)).toThrow();
      expect(() => parseManifest(null)).toThrow();
    });
  });

  describe('ManifestEntry', () => {
    it('requires leastSafeVersion', () => {
      expect(() => parseManifest({ '1': {} })).toThrow();
    });

    it('accepts entry with only leastSafeVersion', () => {
      const result = parseManifest({
        '1': { leastSafeVersion: '1.0.0' },
      });
      expect(result['1']?.leastSafeVersion).toBe('1.0.0');
    });

    it('accepts optional cid and ens fields', () => {
      const result = parseManifest({
        '1': { leastSafeVersion: '1.0.0', cid: 'Qm123', ens: 'lido.eth' },
      });
      expect(result['1']?.cid).toBe('Qm123');
      expect(result['1']?.ens).toBe('lido.eth');
    });

    it('defaults config to empty defaults when omitted', () => {
      const result = parseManifest({ '1': validEntry });
      const config = result['1']?.config;
      expect(config).toBeDefined();
      expect(config?.withdrawalDex).toEqual({
        integration: 'cowswap',
        enabled: false,
      });
      expect(config?.earnVaults).toEqual([]);
      expect(config?.earnAllocation).toEqual({
        labelAllowList: [],
        hiddenIds: [],
      });
      expect(config?.featureFlags).toEqual({});
      expect(config?.pages).toEqual({});
    });
  });

  describe('baseConfig.earnAllocation.labelAllowList', () => {
    it('normalizes words and removes duplicates', () => {
      const result = parseManifest({
        baseConfig: {
          earnAllocation: {
            labelAllowList: ['Aave', 'aave', 'wstETH'],
          },
        },
        '1': validEntry,
      });

      expect(result.baseConfig.earnAllocation.labelAllowList).toEqual([
        'aave',
        'wsteth',
      ]);
      expect(result['1']?.config.earnAllocation.labelAllowList).toEqual([
        'aave',
        'wsteth',
      ]);
    });

    it('rejects entries containing multiple words or slash separators', () => {
      expect(() =>
        parseManifest({
          baseConfig: {
            earnAllocation: { labelAllowList: ['Aave levered'] },
          },
          '1': validEntry,
        }),
      ).toThrow();

      expect(() =>
        parseManifest({
          baseConfig: {
            earnAllocation: { labelAllowList: ['wstETH/ETH'] },
          },
          '1': validEntry,
        }),
      ).toThrow();
    });
  });

  describe('baseConfig.earnAllocation.hiddenIds', () => {
    it('trims IDs and removes duplicates', () => {
      const result = parseManifest({
        baseConfig: {
          earnAllocation: {
            hiddenIds: [' vault-a ', 'vault-a', 'vault-b'],
          },
        },
        '1': validEntry,
      });

      expect(result['1']?.config.earnAllocation.hiddenIds).toEqual([
        'vault-a',
        'vault-b',
      ]);
    });

    it('rejects empty IDs', () => {
      expect(() =>
        parseManifest({
          baseConfig: { earnAllocation: { hiddenIds: ['  '] } },
          '1': validEntry,
        }),
      ).toThrow();
    });
  });

  describe('baseConfig overrides', () => {
    it('recursively merges partial earnAllocation overrides', () => {
      const result = parseManifest({
        baseConfig: {
          earnAllocation: {
            labelAllowList: ['base-label'],
            hiddenIds: ['base-id'],
          },
        },
        '1': {
          ...validEntry,
          config: {
            earnAllocation: {
              hiddenIds: ['network-id'],
            },
          },
        },
      });

      expect(result['1']?.config.earnAllocation).toEqual({
        labelAllowList: ['base-label'],
        hiddenIds: ['network-id'],
      });
    });

    it('recursively merges nested network config objects', () => {
      const result = parseManifest({
        baseConfig: {
          featureFlags: {
            disableSendCalls: false,
            dgBannerEnabled: true,
          },
          pages: {
            '/earn': {
              showNew: true,
              shouldDisable: false,
            },
          },
        },
        '1': {
          ...validEntry,
          config: {
            featureFlags: { dgBannerEnabled: false },
            pages: { '/earn': { shouldDisable: true } },
          },
        },
      });

      expect(result['1']?.config.featureFlags).toEqual({
        disableSendCalls: false,
        dgBannerEnabled: false,
      });
      expect(result['1']?.config.pages['/earn']).toEqual({
        showNew: true,
        shouldDisable: true,
        sections: [],
      });
    });

    it('replaces base arrays with network arrays', () => {
      const result = parseManifest({
        baseConfig: {
          multiChainBanner: [1, 10],
          earnVaults: [{ name: 'eth' }, { name: 'usd' }],
        },
        '1': {
          ...validEntry,
          config: {
            multiChainBanner: [],
            earnVaults: [{ name: 'usd' }],
          },
        },
      });

      expect(result['1']?.config.multiChainBanner).toEqual([]);
      expect(result['1']?.config.earnVaults.map(({ name }) => name)).toEqual([
        'usd',
      ]);
    });

    it('inherits baseConfig when a network config is omitted', () => {
      const result = parseManifest({
        baseConfig: {
          featureFlags: { disableSendCalls: true },
        },
        '1': validEntry,
      });

      expect(result['1']?.config.featureFlags.disableSendCalls).toBe(true);
    });

    it('does not allow special object keys to mutate prototypes', () => {
      const manifest = JSON.parse(`{
        "baseConfig": { "__proto__": { "polluted": true } },
        "1": { "leastSafeVersion": "1.0.0", "config": {} }
      }`);

      parseManifest(manifest);

      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe('config.withdrawalDex', () => {
    it('defaults to disabled cowswap when omitted', () => {
      const result = parseManifest({
        '1': { ...validEntry, config: {} },
      });
      expect(result['1']?.config?.withdrawalDex).toEqual({
        integration: 'cowswap',
        enabled: false,
      });
    });

    it('accepts valid cowswap integration', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: { withdrawalDex: { integration: 'cowswap', enabled: true } },
        },
      });
      expect(result['1']?.config?.withdrawalDex).toEqual({
        integration: 'cowswap',
        enabled: true,
      });
    });

    it('defaults enabled to false when not specified', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: { withdrawalDex: { integration: 'cowswap' } },
        },
      });
      expect(result['1']?.config?.withdrawalDex?.enabled).toBe(false);
    });

    it('ignores unrecognized integration key and returns default (forward compatibility)', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            withdrawalDex: { integration: 'unknown', enabled: true },
          },
        },
      });
      expect(result['1']?.config?.withdrawalDex).toEqual({
        integration: 'cowswap',
        enabled: false,
      });
    });
  });

  describe('config.earnVaults', () => {
    const validVault = { name: 'eth' };

    it('accepts valid vault entries', () => {
      const result = parseManifest({
        '1': { ...validEntry, config: { earnVaults: [validVault] } },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(1);
      expect(result['1']?.config?.earnVaults[0].name).toBe('eth');
    });

    it('filters out entries with unknown vault names (forward compatibility)', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: { earnVaults: [validVault, { name: 'future-vault-type' }] },
        },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(1);
    });

    it('throws on duplicate vault names', () => {
      expect(() =>
        parseManifest({
          '1': {
            ...validEntry,
            config: { earnVaults: [validVault, validVault] },
          },
        }),
      ).toThrow();
    });

    it('applies defaults for optional vault fields', () => {
      const result = parseManifest({
        '1': { ...validEntry, config: { earnVaults: [{ name: 'eth' }] } },
      });
      const vault = result['1']?.config?.earnVaults[0];
      expect(vault?.deposit).toBe(true);
      expect(vault?.withdraw).toBe(true);
      expect(vault?.showNew).toBe(false);
      expect(vault?.deprecated).toBe(false);
      expect(vault?.disabled).toBe(false);
      expect(vault?.apy?.type).toBe('weekly');
    });

    it('accepts all valid vault names', () => {
      const names = ['ggv', 'dvv', 'strategy', 'eth', 'usd'] as const;
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: { earnVaults: names.map((name) => ({ name })) },
        },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(5);
    });

    it('accepts valid apy types', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: { earnVaults: [{ name: 'eth', apy: { type: 'daily' } }] },
        },
      });
      expect(result['1']?.config?.earnVaults[0].apy?.type).toBe('daily');
    });

    it('filters out vault when apy object has invalid type', () => {
      // EarnVaultConfigApyEntrySchema preprocesses invalid apy to undefined,
      // then EarnVaultConfigApySchema fails on undefined — so the whole entry is dropped
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            earnVaults: [{ name: 'eth', apy: { type: 'invalid-type' } }],
          },
        },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(0);
    });

    it('filters out vault when text field exceeds max length', () => {
      // EarnVaultListSchema preprocess drops entries failing EarnVaultConfigEntrySchema
      const longText = 'a'.repeat(251);
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            earnVaults: [{ name: 'eth', depositPauseReasonText: longText }],
          },
        },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(0);
    });

    it('accepts text fields at max length boundary', () => {
      const maxText = 'a'.repeat(250);
      expect(() =>
        parseManifest({
          '1': {
            ...validEntry,
            config: {
              earnVaults: [{ name: 'eth', depositPauseReasonText: maxText }],
            },
          },
        }),
      ).not.toThrow();
    });

    it('filters vault with invalid schema fields rather than failing whole list', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            earnVaults: [
              { name: 'eth' },
              { name: 'usd', deposit: 'not-a-boolean' },
            ],
          },
        },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(1);
      expect(result['1']?.config?.earnVaults[0].name).toBe('eth');
    });
  });

  describe('config.earnVaultsBanner', () => {
    it('defaults showOnStakeForm and showAfterStake to false', () => {
      const result = parseManifest({ '1': validEntry });
      expect(result['1']?.config?.earnVaultsBanner?.showOnStakeForm).toBe(
        false,
      );
      expect(result['1']?.config?.earnVaultsBanner?.showAfterStake).toBe(false);
    });

    it('accepts explicit boolean values', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            earnVaultsBanner: { showOnStakeForm: true, showAfterStake: true },
          },
        },
      });
      expect(result['1']?.config?.earnVaultsBanner?.showOnStakeForm).toBe(true);
      expect(result['1']?.config?.earnVaultsBanner?.showAfterStake).toBe(true);
    });
  });

  describe('config.featureFlags', () => {
    it('accepts known feature flags', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            featureFlags: {
              ledgerLiveL2: true,
              disableSendCalls: false,
              dgBannerEnabled: true,
            },
          },
        },
      });
      expect(result['1']?.config?.featureFlags?.ledgerLiveL2).toBe(true);
      expect(result['1']?.config?.featureFlags?.disableSendCalls).toBe(false);
    });

    it('throws when a known flag has a non-boolean value', () => {
      expect(() =>
        parseManifest({
          '1': {
            ...validEntry,
            config: { featureFlags: { ledgerLiveL2: 'yes' } },
          },
        }),
      ).toThrow();
    });

    it('defaults to empty object when omitted', () => {
      const result = parseManifest({
        '1': { ...validEntry, config: {} },
      });
      expect(result['1']?.config?.featureFlags).toEqual({});
    });
  });

  describe('config.pages', () => {
    it('accepts valid page entries', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: { pages: { '/wrap': { shouldDisable: true } } },
        },
      });
      expect(result['1']?.config?.pages['/wrap']?.shouldDisable).toBe(true);
    });

    it('applies page field defaults', () => {
      const result = parseManifest({
        '1': { ...validEntry, config: { pages: { '/wrap': {} } } },
      });
      const page = result['1']?.config?.pages['/wrap'];
      expect(page?.shouldDisable).toBe(false);
      expect(page?.showNew).toBe(false);
      expect(page?.sections).toEqual([]);
    });

    it('filters out unknown page paths (forward compatibility)', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            pages: {
              '/wrap': {},
              '/unknown-future-page': { shouldDisable: true },
            },
          },
        },
      });
      expect(result['1']?.config?.pages).toHaveProperty('/wrap');
      expect(result['1']?.config?.pages).not.toHaveProperty(
        '/unknown-future-page',
      );
    });

    it('filters out page entries with invalid schema', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: {
            pages: { '/wrap': {}, '/withdrawals': { shouldDisable: 'yes' } },
          },
        },
      });
      expect(result['1']?.config?.pages).toHaveProperty('/wrap');
      expect(result['1']?.config?.pages).not.toHaveProperty('/withdrawals');
    });

    it('throws when stake page (/) is disabled', () => {
      expect(() =>
        parseManifest({
          '1': {
            ...validEntry,
            config: { pages: { '/': { shouldDisable: true } } },
          },
        }),
      ).toThrow('Stake page cannot be disabled');
    });

    it('allows stake page when shouldDisable is false', () => {
      expect(() =>
        parseManifest({
          '1': {
            ...validEntry,
            config: { pages: { '/': { shouldDisable: false } } },
          },
        }),
      ).not.toThrow();
    });
  });

  describe('config.multiChainBanner', () => {
    it('accepts valid chain id list', () => {
      const result = parseManifest({
        '1': { ...validEntry, config: { multiChainBanner: [1, 137, 10] } },
      });
      expect(result['1']?.config?.multiChainBanner).toEqual([1, 137, 10]);
    });

    it('throws on duplicate chain ids', () => {
      expect(() =>
        parseManifest({
          '1': { ...validEntry, config: { multiChainBanner: [1, 1] } },
        }),
      ).toThrow();
    });

    it('throws on chain id less than 1', () => {
      expect(() =>
        parseManifest({
          '1': { ...validEntry, config: { multiChainBanner: [0] } },
        }),
      ).toThrow();
    });

    it('defaults to empty array when omitted', () => {
      const result = parseManifest({
        '1': { ...validEntry, config: {} },
      });
      expect(result['1']?.config?.multiChainBanner).toEqual([]);
    });
  });

  describe('config.api', () => {
    it('accepts api.validation.version', () => {
      const result = parseManifest({
        '1': {
          ...validEntry,
          config: { api: { validation: { version: '2.0' } } },
        },
      });
      expect(result['1']?.config?.api?.validation?.version).toBe('2.0');
    });

    it('defaults to empty object when omitted', () => {
      const result = parseManifest({ '1': validEntry });
      expect(result['1']?.config?.api).toEqual({});
    });
  });

  describe('geo', () => {
    const parseGeo = (geo: unknown) =>
      parseManifest({ '1': { ...validEntry, config: { geo } } })['1']?.config
        .geo;

    it('defaults to an empty country list when omitted', () => {
      const result = parseManifest({ '1': validEntry });
      expect(result['1']?.config.geo).toEqual({ limited: [] });
    });

    it('uppercases and trims country codes', () => {
      expect(parseGeo({ limited: ['us', ' de '] })).toEqual({
        limited: ['US', 'DE'],
      });
    });

    it('deduplicates country codes after normalization', () => {
      expect(parseGeo({ limited: ['US', 'us'] })).toEqual({
        limited: ['US'],
      });
    });

    it('drops entries that are not alpha-2 codes instead of failing', () => {
      expect(parseGeo({ limited: ['US', 'USA', '', 42, null] })).toEqual({
        limited: ['US'],
      });
    });
  });

  describe('forward compatibility', () => {
    it('ignores unknown keys on config object without throwing', () => {
      expect(() =>
        parseManifest({
          '1': {
            ...validEntry,
            config: {
              unknownFutureField: true,
              enabledWithdrawalDexes: ['paraswap'],
            },
          },
        }),
      ).not.toThrow();
    });

    it('ignores unknown keys on manifest entry without throwing', () => {
      expect(() =>
        parseManifest({
          '1': { ...validEntry, unknownEntryField: 'value' },
        }),
      ).not.toThrow();
    });
  });
});
