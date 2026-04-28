import { ManifestSchema } from '../validate';

const validEntry = {
  leastSafeVersion: '1.0.0',
};

describe('ManifestSchema', () => {
  describe('top-level key filtering', () => {
    it('accepts valid chain id keys', () => {
      const result = ManifestSchema.parse({
        '1': validEntry,
        '137': validEntry,
      });
      expect(result).toHaveProperty('1');
      expect(result).toHaveProperty('137');
    });

    it('accepts chain id with suffix', () => {
      const result = ManifestSchema.parse({ '1-staging': validEntry });
      expect(result).toHaveProperty('1-staging');
    });

    it('filters out keys starting with 0', () => {
      const result = ManifestSchema.parse({
        '0': validEntry,
        '01': validEntry,
        '1': validEntry,
      });
      expect(result).not.toHaveProperty('0');
      expect(result).not.toHaveProperty('01');
      expect(result).toHaveProperty('1');
    });

    it('filters out non-numeric keys (forward compatibility)', () => {
      const result = ManifestSchema.parse({ foo: validEntry, '1': validEntry });
      expect(result).not.toHaveProperty('foo');
      expect(result).toHaveProperty('1');
    });

    it('ignores unknown top-level keys instead of throwing', () => {
      expect(() =>
        ManifestSchema.parse({ unknownKey: validEntry, '1': validEntry }),
      ).not.toThrow();
    });

    it('returns empty object for empty input', () => {
      expect(ManifestSchema.parse({})).toEqual({});
    });

    it('throws for non-object input', () => {
      expect(() => ManifestSchema.parse('not-an-object')).toThrow();
      expect(() => ManifestSchema.parse(42)).toThrow();
      expect(() => ManifestSchema.parse(null)).toThrow();
    });
  });

  describe('ManifestEntry', () => {
    it('requires leastSafeVersion', () => {
      expect(() => ManifestSchema.parse({ '1': {} })).toThrow();
    });

    it('accepts entry with only leastSafeVersion', () => {
      const result = ManifestSchema.parse({
        '1': { leastSafeVersion: '1.0.0' },
      });
      expect(result['1']?.leastSafeVersion).toBe('1.0.0');
    });

    it('accepts optional cid and ens fields', () => {
      const result = ManifestSchema.parse({
        '1': { leastSafeVersion: '1.0.0', cid: 'Qm123', ens: 'lido.eth' },
      });
      expect(result['1']?.cid).toBe('Qm123');
      expect(result['1']?.ens).toBe('lido.eth');
    });

    it('defaults config to empty defaults when omitted', () => {
      const result = ManifestSchema.parse({ '1': validEntry });
      const config = result['1']?.config;
      expect(config).toBeDefined();
      expect(config?.enabledWithdrawalDexes).toEqual([]);
      expect(config?.earnVaults).toEqual([]);
      expect(config?.featureFlags).toEqual({});
      expect(config?.pages).toEqual({});
    });
  });

  describe('config.enabledWithdrawalDexes', () => {
    it('accepts known dex values', () => {
      const result = ManifestSchema.parse({
        '1': {
          ...validEntry,
          config: { enabledWithdrawalDexes: ['paraswap', 'bebop'] },
        },
      });
      expect(result['1']?.config?.enabledWithdrawalDexes).toEqual([
        'paraswap',
        'bebop',
      ]);
    });

    it('filters out unknown dex values (forward compatibility)', () => {
      const result = ManifestSchema.parse({
        '1': {
          ...validEntry,
          config: { enabledWithdrawalDexes: ['paraswap', 'unknown-dex'] },
        },
      });
      expect(result['1']?.config?.enabledWithdrawalDexes).toEqual(['paraswap']);
    });

    it('throws on duplicate dex entries', () => {
      expect(() =>
        ManifestSchema.parse({
          '1': {
            ...validEntry,
            config: { enabledWithdrawalDexes: ['paraswap', 'paraswap'] },
          },
        }),
      ).toThrow();
    });

    it('defaults to empty array when omitted', () => {
      const result = ManifestSchema.parse({
        '1': { ...validEntry, config: {} },
      });
      expect(result['1']?.config?.enabledWithdrawalDexes).toEqual([]);
    });
  });

  describe('config.earnVaults', () => {
    const validVault = { name: 'eth' };

    it('accepts valid vault entries', () => {
      const result = ManifestSchema.parse({
        '1': { ...validEntry, config: { earnVaults: [validVault] } },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(1);
      expect(result['1']?.config?.earnVaults[0].name).toBe('eth');
    });

    it('filters out entries with unknown vault names (forward compatibility)', () => {
      const result = ManifestSchema.parse({
        '1': {
          ...validEntry,
          config: { earnVaults: [validVault, { name: 'future-vault-type' }] },
        },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(1);
    });

    it('throws on duplicate vault names', () => {
      expect(() =>
        ManifestSchema.parse({
          '1': {
            ...validEntry,
            config: { earnVaults: [validVault, validVault] },
          },
        }),
      ).toThrow();
    });

    it('applies defaults for optional vault fields', () => {
      const result = ManifestSchema.parse({
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
      const result = ManifestSchema.parse({
        '1': {
          ...validEntry,
          config: { earnVaults: names.map((name) => ({ name })) },
        },
      });
      expect(result['1']?.config?.earnVaults).toHaveLength(5);
    });

    it('accepts valid apy types', () => {
      const result = ManifestSchema.parse({
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
      const result = ManifestSchema.parse({
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
      const result = ManifestSchema.parse({
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
        ManifestSchema.parse({
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
      const result = ManifestSchema.parse({
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
      const result = ManifestSchema.parse({ '1': validEntry });
      expect(result['1']?.config?.earnVaultsBanner?.showOnStakeForm).toBe(
        false,
      );
      expect(result['1']?.config?.earnVaultsBanner?.showAfterStake).toBe(false);
    });

    it('accepts explicit boolean values', () => {
      const result = ManifestSchema.parse({
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
      const result = ManifestSchema.parse({
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
        ManifestSchema.parse({
          '1': {
            ...validEntry,
            config: { featureFlags: { ledgerLiveL2: 'yes' } },
          },
        }),
      ).toThrow();
    });

    it('defaults to empty object when omitted', () => {
      const result = ManifestSchema.parse({
        '1': { ...validEntry, config: {} },
      });
      expect(result['1']?.config?.featureFlags).toEqual({});
    });
  });

  describe('config.pages', () => {
    it('accepts valid page entries', () => {
      const result = ManifestSchema.parse({
        '1': {
          ...validEntry,
          config: { pages: { '/wrap': { shouldDisable: true } } },
        },
      });
      expect(result['1']?.config?.pages['/wrap']?.shouldDisable).toBe(true);
    });

    it('applies page field defaults', () => {
      const result = ManifestSchema.parse({
        '1': { ...validEntry, config: { pages: { '/wrap': {} } } },
      });
      const page = result['1']?.config?.pages['/wrap'];
      expect(page?.shouldDisable).toBe(false);
      expect(page?.showNew).toBe(false);
      expect(page?.sections).toEqual([]);
    });

    it('filters out unknown page paths (forward compatibility)', () => {
      const result = ManifestSchema.parse({
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
      const result = ManifestSchema.parse({
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
        ManifestSchema.parse({
          '1': {
            ...validEntry,
            config: { pages: { '/': { shouldDisable: true } } },
          },
        }),
      ).toThrow('Stake page cannot be disabled');
    });

    it('allows stake page when shouldDisable is false', () => {
      expect(() =>
        ManifestSchema.parse({
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
      const result = ManifestSchema.parse({
        '1': { ...validEntry, config: { multiChainBanner: [1, 137, 10] } },
      });
      expect(result['1']?.config?.multiChainBanner).toEqual([1, 137, 10]);
    });

    it('throws on duplicate chain ids', () => {
      expect(() =>
        ManifestSchema.parse({
          '1': { ...validEntry, config: { multiChainBanner: [1, 1] } },
        }),
      ).toThrow();
    });

    it('throws on chain id less than 1', () => {
      expect(() =>
        ManifestSchema.parse({
          '1': { ...validEntry, config: { multiChainBanner: [0] } },
        }),
      ).toThrow();
    });

    it('defaults to empty array when omitted', () => {
      const result = ManifestSchema.parse({
        '1': { ...validEntry, config: {} },
      });
      expect(result['1']?.config?.multiChainBanner).toEqual([]);
    });
  });

  describe('config.api', () => {
    it('accepts api.validation.version', () => {
      const result = ManifestSchema.parse({
        '1': {
          ...validEntry,
          config: { api: { validation: { version: '2.0' } } },
        },
      });
      expect(result['1']?.config?.api?.validation?.version).toBe('2.0');
    });

    it('defaults to empty object when omitted', () => {
      const result = ManifestSchema.parse({ '1': validEntry });
      expect(result['1']?.config?.api).toEqual({});
    });
  });

  describe('forward compatibility', () => {
    it('ignores unknown keys on config object without throwing', () => {
      expect(() =>
        ManifestSchema.parse({
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
        ManifestSchema.parse({
          '1': { ...validEntry, unknownEntryField: 'value' },
        }),
      ).not.toThrow();
    });
  });
});
